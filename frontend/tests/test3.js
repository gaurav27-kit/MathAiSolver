const nerdamer = require('./node_modules/nerdamer/all.min');

function checkDivergence(expr, lower, upper) {
    try {
        let l = Number(nerdamer(lower).evaluate().toString());
        let u = Number(nerdamer(upper).evaluate().toString());
        if (isNaN(l) || isNaN(u)) return false; // Not numeric bounds, fallback

        const STEPS = 1000;
        const dx = (u - l) / STEPS;
        const f = nerdamer(expr).buildFunction(['x']);

        for (let i = 0; i <= STEPS; i++) {
            let x = l + i * dx;
            let val = f(x);
            if (isNaN(val) || !isFinite(val) || Math.abs(val) > 1e6) {
                return true; // Diverges or hits an asymptote
            }
        }
        return false;
    } catch (e) {
        return false; // Error evaluating, can't be sure
    }
}

console.log('tan(x) [0, 2]:', checkDivergence('tan(x)', '0', '2'));
console.log('1/(x-1) [0, 2]:', checkDivergence('1/(x-1)', '0', '2'));
console.log('1/x [-1, 1]:', checkDivergence('1/x', '-1', '1'));
console.log('x^2 [0, 2]:', checkDivergence('x^2', '0', '2'));
