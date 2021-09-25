use neon::prelude::*;
use serde_json::Value as JSONValue;
use std::{
  sync::mpsc::{self, Sender},
  thread,
};

/// Recursively convert a `JSONValue` to a `JsValue`
fn to_value<'a, C: Context<'a>>(cx: &mut C, value: JSONValue) -> Handle<'a, JsValue> {
  match value {
    JSONValue::Null => cx.null().upcast::<JsValue>(),
    JSONValue::Bool(v) => cx.boolean(v).upcast::<JsValue>(),
    JSONValue::Number(v) => cx.number(v.as_f64().unwrap()).upcast::<JsValue>(),
    JSONValue::String(v) => cx.string(v).upcast::<JsValue>(),
    JSONValue::Array(v) => {
      let a = JsArray::new(cx, v.len() as u32);

      for (i, s) in v.iter().enumerate() {
        let val = to_value(cx, s.to_owned());
        a.set(cx, i as u32, val).unwrap();
      }

      a.upcast::<JsValue>()
    }
    JSONValue::Object(v) => {
      let o = cx.empty_object();

      for (_, (k, s)) in v.iter().enumerate() {
        let key = cx.string(k);
        let val = to_value(cx, s.to_owned());

        o.set(cx, key, val).unwrap();
      }

      o.upcast::<JsValue>()
    }
  }
}

/// Callback used to execute JavaScript off the main thread
type SandboxCallback = Box<dyn FnOnce(&mut boa::Context, &Channel) + Send>;

/// Inter-thread communication messages
enum SandboxMessage {
  // Callback to be executed by the sandbox
  Callback(SandboxCallback),
}

/// Heavy-lifting for sandboxed JavaScript execution
struct Shovel {
  tx: Sender<SandboxMessage>,
}

/// Unused but required
impl Finalize for Shovel {}

/// Implementation of message-passing across threads
impl Shovel {
  /// Construct a new shovel and start an event-loop in a child thread.
  fn new<'a, C>(cx: &mut C) -> Self
  where
    C: Context<'a>,
  {
    let (tx, rx) = mpsc::channel::<SandboxMessage>();
    let channel = cx.channel();

    thread::spawn(move || {
      let mut context = boa::Context::new();

      while let Ok(message) = rx.recv() {
        match message {
          SandboxMessage::Callback(f) => f(&mut context, &channel),
        }
      }
    });

    Self { tx }
  }

  /// Send a message to be processed by the shovel.
  fn send(
    &self,
    callback: impl FnOnce(&mut boa::Context, &Channel) + Send + 'static,
  ) -> Result<(), mpsc::SendError<SandboxMessage>> {
    self.tx.send(SandboxMessage::Callback(Box::new(callback)))
  }
}

/// Methods exposed to JavaScript
impl Shovel {
  /// Construct a new instance of `Shovel`
  fn js_new(mut cx: FunctionContext) -> JsResult<JsBox<Self>> {
    let s = Self::new(&mut cx);

    Ok(cx.boxed(s))
  }

  /// Evaluate JavaScript in the context of a `Shovel` off the main thread
  fn js_eval(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let source = cx.argument::<JsString>(0)?.value(&mut cx);
    let callback = cx.argument::<JsFunction>(1)?.root(&mut cx);
    let shovel = cx.this().downcast_or_throw::<JsBox<Self>, _>(&mut cx)?;

    shovel
      .send(move |context, channel| {
        let val = match context.eval(&source) {
          Ok(v) => Ok(v.to_json(context).unwrap()),
          Err(v) => Err(v.to_json(context).unwrap()),
        };

        channel.send(move |mut cx| {
          let callback = callback.into_inner(&mut cx);
          let this = cx.undefined();
          let args: Vec<Handle<JsValue>> = match val {
            Ok(v) => vec![cx.null().upcast(), to_value(&mut cx, v)],
            Err(v) => vec![to_value(&mut cx, v)],
          };

          callback.call(&mut cx, this, args)?;

          Ok(())
        })
      })
      .or_else(|err| cx.throw_error(err.to_string()))?;

    Ok(cx.undefined())
  }
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
  cx.export_function("shovelNew", Shovel::js_new)?;
  cx.export_function("shovelEval", Shovel::js_eval)?;

  Ok(())
}
