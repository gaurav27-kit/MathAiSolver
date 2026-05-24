const nerdamer = require('./node_modules/nerdamer/all.min');

function testIntegral(expr, lower, upper) {
    try {
        let antiderivative = nerdamer(`integrate(${expr}, x)`).toString();
        let upperValue = nerdamer(antiderivative).sub('x', upper).toString();
        let lowerValue = nerdamer(antiderivative).sub('x', lower).toString();
        let definiteValue = nerdamer(`${upperValue}-(${lowerValue})`).expand().toString();
        console.log(`Integral of ${expr} from ${lower} to ${upper} = ${definiteValue}`);
    } catch (e) {
        console.log(`Integral of ${expr} from ${lower} to ${upper} FAILED: ${e.message}`);
    }
}

testIntegral('1/x', '0', '1');
testIntegral('1/x^2', '0', '1');
testIntegral('sec(x)^2', '0', 'pi/2');
