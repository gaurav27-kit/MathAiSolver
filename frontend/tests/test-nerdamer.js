const nerdamer = require('nerdamer/all.min');

let v = 'x';

console.log('nerdamer(sin(pi)):', nerdamer('sin(pi)').toString());
console.log('nerdamer(sin(x)).sub(x,pi):', nerdamer('sin(x)').sub('x', 'pi').toString());

let sub1 = nerdamer('sin(x)').sub('x', 'pi').toString();
console.log('nerdamer(sub1):', nerdamer(sub1).toString());

let sub2 = nerdamer('x^3').sub('x', 'pi').toString();
console.log('nerdamer(x^3 sub pi):', nerdamer(sub2).toString());

// Also try expanding:
console.log('expanded:', nerdamer(sub1).expand().toString());
