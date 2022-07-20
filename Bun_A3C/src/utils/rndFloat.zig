const std = @import("std");
const RndGen = std.rand.DefaultPrng;

pub export fn rndFloat() f64 {
  var rnd = RndGen.init(0);
  return rnd.random().float(f64);
}