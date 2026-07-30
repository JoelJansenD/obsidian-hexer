export default class PriorityQueue<T> {
    private items: { item: T; priority: number }[];

    constructor() {
        this.items = [];
    }

    public enqueue(item: T, priority: number): void {
        for(let i = 0; i < this.items.length; i++) {
            if(this.items[i].priority > priority) {
                this.items.splice(i, 0, { item, priority });
                return;
            }
        }

        this.items.push({ item, priority });
    }

    public dequeue() {
        if(this.items.length === 0) {
            throw new Error('PriorityQueue is empty');
        }

        return this.items.shift()!;
    }

    public isEmpty(): boolean {
        return this.items.length === 0;
    }
}