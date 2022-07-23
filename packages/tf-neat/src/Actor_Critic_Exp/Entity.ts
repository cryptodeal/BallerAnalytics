export class Entity {
	public x: number;
	public y: number;
	public reward: number;
	public color: string;
	public type: string;

	constructor(x: number, y: number, reward: number, color: string, type: string) {
		this.x = x;
		this.y = y;
		this.reward = reward;
		this.color = color;
		this.type = type;
	}
}
