const nerdamer = require('./node_modules/nerdamer/all.min');

const FUNCTION_NAMES = ['asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'sqrt', 'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'log', 'ln', 'abs', 'exp'];

function expandFunctionShorthand(expression) {
    let expanded = expression;
    FUNCTION_NAMES.forEach((fnName) => { expanded = replaceFunctionAtoms(expanded, fnName); });
    return expanded;
}

function findFunctionArgumentEnd(expression, startIndex) {
    if (startIndex >= expression.length) { return startIndex; }
    if (expression[startIndex] === '(') {
        let depth = 0;
        for (let index = startIndex; index < expression.length; index += 1) {
            if (expression[index] === '(') depth += 1;
            else if (expression[index] === ')') {
                depth -= 1;
                if (depth === 0) return index + 1;
            }
        }
        return expression.length;
    }
    let index = startIndex;
    if (expression[index] === '+' || expression[index] === '-') index += 1;
    while (index < expression.length && !'+-*/,)='.includes(expression[index])) index += 1;
    return index;
}

function replaceFunctionAtoms(expression, fnName) {
    let output = '';
    let index = 0;
    while (index < expression.length) {
        if (expression.startsWith(fnName, index) && expression[index + fnName.length] !== '(') {
            const atomStart = index + fnName.length;
            const atomEnd = findFunctionArgumentEnd(expression, atomStart);
            if (atomEnd > atomStart) {
                output += `${fnName}(${expression.slice(atomStart, atomEnd)})`;
                index = atomEnd;
                continue;
            }
        }
        output += expression[index];
        index += 1;
    }
    return output;
}

function normalizeMathInput(expression) {
    if (!expression) { return ''; }

    let normalized = expression.replace(/\s+/g, '');
    normalized = normalized.replace(/\u2212/g, '-');
    normalized = normalized.replace(/\u00F7/g, '/');
    normalized = normalized.replace(/\u00D7/g, '*');
    normalized = normalized.replace(/\u03C0/g, 'pi');
    normalized = normalized.replace(/pie/ig, 'pi');
    normalized = normalized.replace(/\[/g, '(').replace(/\]/g, ')');
    normalized = normalized.replace(/\{/g, '(').replace(/\}/g, ')');

    // ADDED FIX FOR TRIGONOMETRIC POWERS
    normalized = normalized.replace(/(asin|acos|atan|sinh|cosh|tanh|sqrt|sin|cos|tan|sec|csc|cot|log|ln|abs|exp)\^([0-9]+(?:\.[0-9]+)?|\([^)]+\))([a-zA-Z]|\([^)]+\))/g, '($1($3))^$2');

    normalized = expandFunctionShorthand(normalized);
    normalized = normalized.replace(/(\d)([A-Za-z(])/g, '$1*$2');
    normalized = normalized.replace(/(\))(\d|[A-Za-z(])/g, '$1*$2');
    normalized = normalized.replace(/([A-Za-z])(\()/g, (match, left, right, offset, source) => {
        const fragment = source.slice(Math.max(0, offset - 4), offset + 1);
        const isFunction = FUNCTION_NAMES.some((name) => fragment.endsWith(name));
        return isFunction ? `${left}${right}` : `${left}*${right}`;
    });
    return normalized;
}

let result = normalizeMathInput("sin^2x+cosx");
console.log("Normalized:", result);
try {
    let intg = nerdamer(`integrate(${result},x)`).toString();
    console.log("Antiderivative:", intg);
} catch (e) {
    console.error("Failed!", e.message);
}
