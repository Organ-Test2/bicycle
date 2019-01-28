import mouseHandler from './mousehandler';
import * as paper from 'paper';
import keys from './keys';
import * as PaperHelper from './paperhelper';
import * as math from 'mathjs';

class Demo {
	postInit(viewController) {
		this.viewController = viewController;
		const wallHelper = (positionA, positionB) => {
			const config = {
				pinned: true,
				color: 'black',
				radius: 2
			};

			const ballA = viewController.createBall(positionA, Object.assign({}, config));
			const ballB = viewController.createBall(positionB, config);

			return viewController.addNewJoint(ballA, ballB, { thickness: 1, collidable: true });
		};
		const createJoints = () => {
			let ballsAdded = [];
			const K = 10;
			const L = 40;
			for (let i = 0; i < K; ++i) {
				let position = [100, 70 + i * L];
				const config = {
					pinned: i == 0 || i == K - 1,
					color: 'black',
					radius: 2,
					ignoreNormal: i > 0 && i + 1 < K
				};
				let ball = viewController.createBall(position, config);
				ballsAdded.push(ball);
			}
			for (let i = 1; i < K; ++i) {
				viewController.addNewJoint(ballsAdded[i - 1], ballsAdded[i], { collidable: true, color: 'grey', thickness: 2 });
			}
			let lastNode = ballsAdded.slice(-1)[0];
			lastNode.setPosition([300, 170]);
		}

		createJoints();

		let config = {
			pinned: true,
			color: 'black',
			radius: 2
		};
		const bounds = paper.view.getSize();
		wallHelper([0, bounds.height], [bounds.width, bounds.height]);
		wallHelper([bounds.width, 0], [bounds.width, bounds.height]);
		wallHelper([0, 0], [bounds.width, 0]);
		wallHelper([0, 0], [0, bounds.height]);

		this.addBigCircle([30, 30]);

		config = Object.assign({}, config);
		config.rigid = true;
		config.radius = 10;
		config.pinned = false;
		const positionA = [40, 300];
		const positionB = [90, 300];
		const ballA = viewController.createBall(positionA, Object.assign({}, config));
		const ballB = viewController.createBall(positionB, config);

		this.wheel = viewController.addNewJoint(ballA, ballB, { thickness: 1, collidable: true, weightageA: 0.5, weightageB: .5 });
		this.vehicleVel = [0, 0];

		const cfg = Object.assign({}, config, { pinned: true, rigid: false });
		cfg.radius = 2;
		const pa = viewController.createBall([0, 0], cfg);
		const pb = viewController.createBall([1, 0], cfg);
		this.collisionLine = viewController.addNewJoint(pa, pb, { thickness: 3, color: 'red', collidable: false });

		mouseHandler(viewController);
	};

	addBigCircle(position) {
		const config = {
			color: 'silver',
			rigid: true,
			pinned: false,
			radius: 20
		};
		this.viewController.createBall(position, config);
	}

	preUpdateCallback(event) {
		let wheel = this.wheel;
		const dt = event.delta;
		const engine = this.viewController.getEngine();
		const collision = engine.getCollidingObjects(wheel.v1);
		let colInfo;
		if (collision.length > 0) {
			colInfo = collision[0];
			this.collisionLine.v1.position = colInfo.joint.v1.position;
			this.collisionLine.v2.position = colInfo.joint.v2.position;
			this.collisionLine.updateDistance();
		}

		const f = 0.4;
		const addVel = (collisionInfo, f) => {
			const ci = collisionInfo.collisionInfo;
			const dir = [-ci.axis[1], ci.axis[0]];
			const dv = math.multiply(dir, f * dt);
			const L = math.norm(this.vehicleVel);
			const u = 8;
			if (L > u) {
				this.vehicleVel = math.divide(this.vehicleVel, L / u);
				return;
			}
			this.vehicleVel = math.add(this.vehicleVel, dv);
		};
		if (keys['d']) {
			if (wheel != null) {
				if (colInfo) {
					addVel(colInfo, f);
				}
			}
		}
		if (keys['a']) {
			if (wheel != null) {
				if (colInfo) {
					addVel(colInfo, -f);
				}
			}
		}
		if (keys[' ']) {
			if (colInfo) {
				const del = [0, -120 * dt];
				wheel.v1.position = math.add(wheel.v1.position, del);
				wheel.v2.position = math.add(wheel.v2.position, del);
			}
		}
		this.vehicleVel = math.multiply(this.vehicleVel, 0.99);
		if (wheel != null) {
			wheel.v1.position = math.add(wheel.v1.position, this.vehicleVel);
			wheel.v1.position = math.add(wheel.v1.position, this.vehicleVel);
		}
	}
}

const buildCloth = () => {
	let x = w / 2;
	let y = h / 2;
	let ww = 10;
	let l = balls.length;
	let C = 10;
	for (let i = 0; i < C; ++i) {
		for (let j = 0; j < C; ++j) {
			let pos = [x + j * ww, y + i * ww];
			addNewVertex(pos, i == 0);
			let k = l + i * C + j;
			if (j) addNewJoint(k - 1, k);
			if (i) {
				addNewJoint(k - C, k);
				// if (j) addNewJoint(k - C - 1, k);
				// if (j + 1 < C) addNewJoint(k - C + 1, k);
			}
		}
	}
};

// buildCloth();

export default Demo;
