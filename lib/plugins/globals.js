exports.name = 'globals';

exports.attach = function (_options) {}

exports.init = function (done) {
  if(this.IAmParent)//I'm in the parent ("sandbox")
    return done();

  // see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects
  this.sandbox.Array = Array;
  this.sandbox.Boolean = Boolean;
  this.sandbox.Date = Date;
  this.sandbox.Function = Function;
  this.sandbox.Number = Number;
  this.sandbox.Object = Object;
  this.sandbox.RegExp = RegExp;
  this.sandbox.String = String;
  this.sandbox.Error = Error;
  this.sandbox.EvalError = EvalError;
//  this.sandbox.InternalError = InternalError;
  this.sandbox.ReferenceError = ReferenceError;
//  this.sandbox.StopIteration = StopIteration;
  this.sandbox.SyntaxError = SyntaxError;
  this.sandbox.TypeError = TypeError;
  this.sandbox.URIError = URIError;

  this.sandbox.decodeURI = decodeURI;
  this.sandbox.decodeURIComponent = decodeURIComponent;
  this.sandbox.encodeURI = encodeURI;
  this.sandbox.encodeURIComponent = encodeURIComponent;
  this.sandbox.eval = eval;
  this.sandbox.isFinite = isFinite;
  this.sandbox.isNaN = isNaN;
  this.sandbox.parseFloat = parseFloat;
  this.sandbox.parseInt = parseInt;
//  this.sandbox.uneval = uneval;

  this.sandbox.Infinity = Infinity;
  this.sandbox.JSON = JSON;
  this.sandbox.Math = Math;
  this.sandbox.NaN = NaN;
  this.sandbox.undefined = undefined;

  return done()
}

