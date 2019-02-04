const Brain = require(process.cwd() + '/core/functions/latestBrain');
const B = new Brain();

test('brain loads', () => {
    expect(B.testStart()).toBe(1);
});