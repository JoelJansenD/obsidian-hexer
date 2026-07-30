import PriorityQueue from "./PriorityQueue";

describe('enqueue', () => {
    let queueToTest: PriorityQueue<number>;
    beforeEach(() => {
        queueToTest = new PriorityQueue<number>();
    });

    it('enqueues elements in ascending order by priority', () => {
        // Arrange
        const elementsToEnqueue = [
            { item: 1, priority: 5 },
            { item: 2, priority: 3 },
            { item: 3, priority: 4 },
            { item: 4, priority: 1 },
            { item: 5, priority: 2 },
        ];

        // Act
        elementsToEnqueue.forEach(({ item, priority }) => {
            queueToTest.enqueue(item, priority);
        });

        // Assert
        const dequeuedElements: number[] = [];
        while (!queueToTest.isEmpty()) {
            dequeuedElements.push(queueToTest.dequeue()!.item);
        }
        expect(dequeuedElements).toEqual([4, 5, 2, 3, 1]);
    });
});

describe('dequeue', () => {
    let queueToTest: PriorityQueue<number>;
    beforeEach(() => {
        queueToTest = new PriorityQueue<number>();
        queueToTest.enqueue(1, 5);
        queueToTest.enqueue(2, 3);
        queueToTest.enqueue(3, 4);
    });

    it('dequeues the element with the highest priority (lowest number)', () => {
        // Act
        const dequeuedElement = queueToTest.dequeue();

        // Assert
        expect(dequeuedElement).toEqual({ item: 2, priority: 3 });
    });
});

describe('isEmpty', () => {
    it('returns false when the queue contains some elements', () => {
        // Arrange
        const queueToTest = new PriorityQueue<number>();
        queueToTest.enqueue(1, 5);

        // Act
        const result = queueToTest.isEmpty();

        // Assert
        expect(result).toBe(false);
    });

    it('returns true when the queue is empty', () => {
        // Arrange
        const queueToTest = new PriorityQueue<number>();

        // Act
        const result = queueToTest.isEmpty();

        // Assert
        expect(result).toBe(true);
    });
});