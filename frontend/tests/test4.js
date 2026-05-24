const nerdamer = require('./node_modules/nerdamer/all.min');

function checkDivergence(expr, lower, upper) {
    try {
        let l = Number(nerdamer(lower).evaluate().toString());
        let u = Number(nerdamer(upper).evaluate().toString());
        if (isNaN(l) || isNaN(u)) return false;

        const STEPS = 1000;
        const dx = (u - l) / STEPS;
        const f = nerdamer(expr).buildFunction(['x']);

        let hasLargeValue = false;
        let lastSign = null;
        let flippedSignLarge = false;

        for (let i = 0; i <= STEPS; i++) {
            let x = l + i * dx;
            let val = f(x);
            if (isNaN(val) || !isFinite(val)) {
                return true;
            }
            if (Math.abs(val) > 1000) {
                hasLargeValue = true;
                let currentSign = Math.sign(val);
                if (lastSign !== null && currentSign !== lastSign && Math.abs(val - f(x - dx)) > 1000) {
                    flippedSignLarge = true;
                }
                lastSign = currentSign;
            } else {
                lastSign = Math.sign(val);
            }
        }
        return hasLargeValue && flippedSignLarge || hasLargeValue && Math.max(Math.abs(f(l)), Math.abs(f(u))) < 100;
    } catch (e) {
        return false;
    }
}

console.log('tan(x) [0, 2]:', checkDivergence('tan(x)', '0', '2'));
console.log('(sin(x))^2+cos(x)+tan(x) [0, 2]:', checkDivergence('(sin(x))^2+cos(x)+tan(x)', '0', '2'));
