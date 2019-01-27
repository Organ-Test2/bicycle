import * as math from 'mathjs';

const lineCircleCollision = (p1, p2, p1IgnoreNormal, p2IgnoreNormal, ball, vel, radius) => {
	var dj = math.subtract(p1, p2);
	var djNormal = [-dj[1], dj[0]];
	const checkColl = (projAxis) => {
		var norm = math.norm(projAxis);
		projAxis = math.divide(projAxis, norm);
		// if (math.dot(vel, projAxis) >= 0) return false;
		var projCircle = math.dot(ball, projAxis);
		var proja = math.dot(p1, projAxis);
		var projb = math.dot(p2, projAxis);
		if (projb < proja) [proja, projb] = [projb, proja];
		var pc1 = projCircle - radius;
		var pc2 = projCircle + radius;
		var prj;
		if (proja >= pc1 && projb <= pc2) {
			//proj of line completely inside circle
			prj = proja - pc1;
		} else if (pc1 >= proja && pc2 <= projb) {
			//proj of circle completely inside line
			prj = projb - pc1;
		} else {
			var d1 = Math.max(pc1, proja);
			var d2 = Math.min(pc2, projb);
			if (d1 >= d2) return false;
			prj = d2 - d1;
			if (pc2 > proja && pc2 < projb) {
				projAxis = math.multiply(projAxis, -1);
			}
		}
		if (prj <= 1e-3) return false;
		return { projAxis, penetration: prj };
	}
	var normal = [-djNormal[1], djNormal[0]];
	if (math.dot(djNormal, math.subtract(ball, p2)) < 0) {
		djNormal = math.multiply(djNormal, -1);
	}
	var a = checkColl(djNormal);
	if (!a) return false;
	var axis1 = math.subtract(ball, p1);
	var b = checkColl(axis1);
	if (!b) return false;
	var axis2 = math.subtract(ball, p2);
	var c = checkColl(axis2);
	if (!c) return false;
	var d = [a];
	if (!p1IgnoreNormal) d.push(b);
	if (!p2IgnoreNormal) d.push(c);
	var minp = d.map(m => m.penetration).sort((a, b) => a - b)[0];
	var bestAxis = d.filter(v => v.penetration == minp)[0].projAxis;
	return { axis: bestAxis, penetration: minp };
};

export const rotateZ = (vec, angle) => {
	let cs = Math.cos(angle);
	let si = Math.sin(angle);
	let rot_mat = [
		[cs, -si],
		[si, cs]
	];
	let c = math;
	return math.multiply(rot_mat, vec);
};


export default lineCircleCollision;
