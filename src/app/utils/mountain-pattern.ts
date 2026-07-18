const PATTERN_SIZE = 128;
const POLYGON_COUNT = 40;
const MIN_RADIUS = 10;
const MAX_RADIUS = 28;
const MIN_SHADE = 0.05;
const MAX_SHADE = 0.5;
const MID_GREY = '#7b766f';

const LIGHT_ANGLE = Math.PI / 4;
const HALF_PLANE_SIZE = MAX_RADIUS * 3;

type PatternPoint = [number, number];

export function generateMountainPattern(): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = PATTERN_SIZE;
    canvas.height = PATTERN_SIZE;
    const context = canvas.getContext('2d')!;

    for (let i = 0; i < POLYGON_COUNT; i++) {
        drawWrappedPolygon(context);
    }

    return context.getImageData(0, 0, PATTERN_SIZE, PATTERN_SIZE);
}

function drawWrappedPolygon(context: CanvasRenderingContext2D): void {
    const center: PatternPoint = [Math.random() * PATTERN_SIZE, Math.random() * PATTERN_SIZE];
    const points = createRandomPolygon(center);
    const amount = MIN_SHADE + Math.random() * (MAX_SHADE - MIN_SHADE);

    for (const offsetX of [-PATTERN_SIZE, 0, PATTERN_SIZE]) {
        for (const offsetY of [-PATTERN_SIZE, 0, PATTERN_SIZE]) {
            fillBeveledPolygon(
                context,
                points.map(([x, y]) => [x + offsetX, y + offsetY]),
                [center[0] + offsetX, center[1] + offsetY],
                amount,
            );
        }
    }
}

function createRandomPolygon([cx, cy]: PatternPoint): PatternPoint[] {
    const sides = Math.random() < 0.5 ? 3 : 4;
    const radius = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);
    const angleOffset = Math.random() * Math.PI * 2;

    return Array.from({ length: sides }, (_, index) => {
        const angle = angleOffset + (index / sides) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
        const pointRadius = radius * (0.6 + Math.random() * 0.4);
        return [cx + Math.cos(angle) * pointRadius, cy + Math.sin(angle) * pointRadius];
    });
}

function fillBeveledPolygon(
    context: CanvasRenderingContext2D,
    points: PatternPoint[],
    center: PatternPoint,
    amount: number,
): void {
    context.save();

    context.beginPath();
    points.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
    context.closePath();
    context.clip();

    context.translate(center[0], center[1]);
    context.rotate(LIGHT_ANGLE);

    context.fillStyle = shadeColor(MID_GREY, amount);
    context.fillRect(-HALF_PLANE_SIZE, -HALF_PLANE_SIZE, HALF_PLANE_SIZE, HALF_PLANE_SIZE * 2);

    context.fillStyle = shadeColor(MID_GREY, -amount);
    context.fillRect(0, -HALF_PLANE_SIZE, HALF_PLANE_SIZE, HALF_PLANE_SIZE * 2);

    context.restore();
}

function shadeColor(hex: string, amount: number): string {
    const value = parseInt(hex.slice(1), 16);
    const target = amount > 0 ? 255 : 0;
    const ratio = Math.abs(amount);

    // eslint-disable-next-line no-bitwise
    const [r, g, b] = [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff].map(channel =>
        Math.round(channel + (target - channel) * ratio),
    );

    return `rgba(${r}, ${g}, ${b}, 1)`;
}