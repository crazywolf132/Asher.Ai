const Brain = require(process.cwd() + '/core/functions/latestBrain').default;
const B = new Brain();

describe('Brain', () => {
    describe('Startup', () => {
        it('should return 1 for successfull startup', () => {
            B.testStart();
        });
    });

    describe('Size', () => {
        it('Associations DB size >= 1', () => {
            Object.keys(B.__associationsDB).length >= 1;
        });

        it('Backlinks DB size >= Associations DB size', () => {
            Object.keys(B.__reverse_associationsDB).length >= Object.keys(B.__associationsDB).length;
        });
    });
});
