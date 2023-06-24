import {
    create,
    fractionDependencies,
    addDependencies,
    divideDependencies,
    formatDependencies,
    parserDependencies,
    expDependencies,
    sinDependencies,
    cosDependencies,
    tanDependencies,
  } from 'mathjs';

const math = create({
    fractionDependencies,
    addDependencies,
    divideDependencies,
    formatDependencies,
    parserDependencies,
    expDependencies,
    sinDependencies,
    cosDependencies,
    tanDependencies
});

export const formulaParser = math.parser();
formulaParser.evaluate('f(t) = exp(-0.1 * t) * sin((2 / 3) * t)');
