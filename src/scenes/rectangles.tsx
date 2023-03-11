import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Circle, Line, Node, Latex, Text } from '@motion-canvas/2d/lib/components';
import { createRef, Reference } from '@motion-canvas/core/lib/utils';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { linear } from '@motion-canvas/core/lib/tweening';
import { all, waitFor } from '@motion-canvas/core/lib/flow';

const LATEX = String.raw;
const RESOLUTION_X = 1920
const RESOLUTION_Y = 1080



const RGB_L_WHITE = [255, 255, 255]
const RGB_L_GREY = [128, 128, 128]

const RGB_L_CAT = [[46, 234, 162],
[46, 165, 234],
[68, 46, 234],
[209, 46, 234],
[234, 46, 118],
[234, 115, 46],
[212, 234, 46],
[71, 234, 46]]

type num_list_to_str = (arr: number[]) => string

// TODO: maybe sanity check for array length
let to_rgb: num_list_to_str = (arr) => {
    return 'rgb(' + arr.toString() + ')'
}

let to_tex_rgb: num_list_to_str = (arr: number[]) => {
    return '\\color[RGB]{' + arr.toString() + '}'
}


let map_nested_color_list = (color_list: number[][], fn: num_list_to_str): {
    [key: string]: string;
} =>
    color_list
        .map(fn)
        .map((element, index) => [String.fromCharCode(65 + index), element])
        .reduce<{ [key: string]: string }>((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

const CLR = {
    CAT: map_nested_color_list(RGB_L_CAT, to_rgb),
    WHITE: to_rgb(RGB_L_WHITE),
    GREY: to_rgb(RGB_L_GREY)
} as const

const CLRT = {
    CAT: map_nested_color_list(RGB_L_CAT, to_tex_rgb),
    WHITE: to_tex_rgb(RGB_L_WHITE),
    GREY: to_tex_rgb(RGB_L_GREY)
} as const




const LINE_WIDTH = 8
const TEX_HEIGHT = 40

const PHI = (1 + Math.sqrt(5)) / 2
const ALPHA = PHI / (1 + PHI)
const BETA = 1 / (1 + PHI)
const Z = 900
const A = ALPHA * Z
const B = BETA * Z

const SPEED = 500


function sign(n: number): number {
    return Math.pow(-1, n) * Math.pow(-1, Math.floor(n / 2))
}

function golden_lines(a: number, b: number, group_ref: Reference<Node>, line_refs: Array<Reference<Line>>) {
    const z = a + b
    const l = line_refs.length

    let x_1: Vector2 = new Vector2(z, a)
    let x_2: Vector2

    for (let n = 1; n < l + 1; n++) {
        let vec_base = new Vector2(n % 2, (n + 1) % 2)
        let vec_signed = vec_base.scale(sign(n))
        let vec_scaled = vec_signed.scale(z * BETA * Math.pow(ALPHA, n - 1))
        x_1 = x_1.add(vec_scaled)

        vec_base = new Vector2((n + 1) % 2, n % 2)
        vec_signed = vec_base.scale(sign(n + 1))
        vec_scaled = vec_signed.scale(z * Math.pow(ALPHA, n))
        x_2 = x_1.add(vec_scaled)


        group_ref().add(<Line
            ref={line_refs[n - 1]}
            stroke={CLR.WHITE}
            lineWidth={LINE_WIDTH}
            points={[x_1, x_2]}
            end={0}
        />)
    }
}

function golden_circles(ref_group: Reference<Node>, ref_lines: Array<Reference<Line>>, ref_circles: Array<Reference<Line>>) {
    for (let i = 0; i < ref_lines.length; i++) {
        const l = ref_lines[i]
        const ll = line_length(l)
        const points: Vector2[] = l().points.context.raw() // NOTE: how to fix this

        ref_group().add(
            <Circle
                ref={ref_circles[i]}
                x={points[0].x}
                y={points[0].y}
                width={ll * 2}
                height={ll * 2}
                stroke={CLR.WHITE}
                lineWidth={LINE_WIDTH}
                startAngle={180 + 90 * i}
                endAngle={180 + 90 * i}
            />
        )
    }
}

function line_length(ref_line: Reference<Line>): number {
    const points: Vector2[] = ref_line().points.context.raw() // NOTE: how to fix this
    console.log(points)
    const n_points = points.length
    let line_length = 0

    for (let i = 1; i < n_points; i++) {
        const start = points[i]
        const stop = points[i - 1]
        line_length = line_length + stop.sub(start).magnitude
    }
    return line_length
}

function line_draw_time(ref_line: Reference<Line>): number {
    const ll = line_length(ref_line)
    return ll / (SPEED)
}

function circle_draw_time(radius: number): number {
    return (2 * Math.PI * radius) / (SPEED * 4)
}

export default makeScene2D(function* (view) {
    const REF_PLOT = createRef<Node>();
    const REF_TEXT = createRef<Node>();

    const REF_RECT_0 = createRef<Line>();
    const REF_RECT_1 = createRef<Line>();
    const REF_RECT_2 = createRef<Line>();
    const REF_RECT_3 = createRef<Line>();
    const REF_RECT_4 = createRef<Line>();
    const REF_RECT_5 = createRef<Line>();

    const REF_LABEL_A = createRef<Latex>();
    const REF_LABEL_APB_A = createRef<Latex>();
    const REF_LABEL_APB_B = createRef<Latex>();
    const REF_LABEL_APB_P = createRef<Latex>();

    const REF_LINE_0 = createRef<Line>();
    const REF_LINE_1 = createRef<Line>();
    const REF_LINE_2 = createRef<Line>();
    const REF_LINE_3 = createRef<Line>();
    const REF_LINE_4 = createRef<Line>();
    const REF_LINE_5 = createRef<Line>();
    const REF_LINE_6 = createRef<Line>();
    const REF_LINE_7 = createRef<Line>();

    const REF_RATIO_0_C = createRef<Latex>();
    const REF_RATIO_0_W = createRef<Latex>();
    const REF_RATIO_1 = createRef<Latex>();
    const REF_RATIO_2_C = createRef<Latex>();
    const REF_RATIO_2_W = createRef<Latex>();
    const REF_RATIO_3 = createRef<Latex>();
    const REF_RATIO_4 = createRef<Latex>();
    const REF_RATIO_5 = createRef<Text>();

    const REF_CIRCLE_0 = createRef<Circle>();
    const REF_CIRCLE_1 = createRef<Circle>();
    const REF_CIRCLE_2 = createRef<Circle>();
    const REF_CIRCLE_3 = createRef<Circle>();
    const REF_CIRCLE_4 = createRef<Circle>();
    const REF_CIRCLE_5 = createRef<Circle>();
    const REF_CIRCLE_6 = createRef<Circle>();
    const REF_CIRCLE_7 = createRef<Circle>();

    const REF_LINES = [
        REF_LINE_0,
        REF_LINE_1,
        REF_LINE_2,
        REF_LINE_3,
        REF_LINE_4,
        REF_LINE_5,
        REF_LINE_6,
        REF_LINE_7,
    ]

    const REF_CIRCLES = [
        REF_CIRCLE_0,
        REF_CIRCLE_1,
        REF_CIRCLE_2,
        REF_CIRCLE_3,
        REF_CIRCLE_4,
        REF_CIRCLE_5,
        REF_CIRCLE_6,
        REF_CIRCLE_7,
    ]

    view.add(<Node ref={REF_PLOT} x={-Z / 2} y={-(A) / 2} />);
    view.add(<Node ref={REF_TEXT} x={Z / 2 + 120} />);

    golden_lines(A, B, REF_PLOT, REF_LINES)
    golden_circles(REF_PLOT, REF_LINES, REF_CIRCLES)

    REF_PLOT().add(<><Line
        ref={REF_RECT_0}
        stroke={CLR.WHITE}
        lineWidth={8}
        points={[
            new Vector2([0 - 4, 0]),
            new Vector2([A + 2, 0]),
        ]}
        end={0}
    />
        <Line
            ref={REF_RECT_1}
            stroke={CLR.WHITE}
            lineWidth={8}
            points={[
                new Vector2([A, 0]),
                new Vector2([Z + 5, 0]),
            ]}
            end={0}
        />
        <Line
            ref={REF_RECT_2}
            stroke={CLR.WHITE}
            lineWidth={8}
            points={[
                new Vector2([Z, 0]),
                new Vector2([Z, B + 2]),
            ]}
            end={0}
        />
        <Line
            ref={REF_RECT_3}
            stroke={CLR.WHITE}
            lineWidth={8}
            points={[
                new Vector2([Z, B]),
                new Vector2([Z, A + 5]),
            ]}
            end={0}
        />
        <Line
            ref={REF_RECT_4}
            stroke={CLR.WHITE}
            lineWidth={8}
            points={[
                new Vector2([Z + 4, A]),
                new Vector2([-5, A]),
            ]}
            end={0}
        />
        <Line
            ref={REF_RECT_5}
            stroke={CLR.WHITE}
            lineWidth={8}
            points={[
                new Vector2([0, A - 4]),
                new Vector2([0, 3]),
            ]}
            end={0}
        />
        <Latex
            ref={REF_LABEL_A}
            tex={LATEX`${CLRT.WHITE} A`}
            height={TEX_HEIGHT}
            x={- 1.5 * TEX_HEIGHT}
            y={A / 2}
            alpha={0}
        />
        <Latex
            ref={REF_LABEL_APB_A}
            tex={LATEX`${CLRT.WHITE} A`}
            height={TEX_HEIGHT}
            x={Z / 2 - 50}
            y={A + 1.5 * TEX_HEIGHT}
            alpha={0}
        />
        <Latex
            ref={REF_LABEL_APB_P}
            tex={LATEX`${CLRT.WHITE}+`}
            height={TEX_HEIGHT - 2 - 5}
            x={Z / 2}
            y={A + 1.5 * TEX_HEIGHT}
            alpha={0}
        />
        <Latex
            ref={REF_LABEL_APB_B}
            tex={LATEX`${CLRT.WHITE} B`}
            height={TEX_HEIGHT}
            x={Z / 2 + 48}
            y={A + 1.5 * TEX_HEIGHT}
            alpha={0}
        />
    </>)

    REF_TEXT().add(
        <>
            <Latex
                ref={REF_RATIO_0_C}
                tex={LATEX`${CLRT.WHITE}\frac{${CLRT.CAT.B}A\color{white}+${CLRT.CAT.E}B}{${CLRT.CAT.B}A}`}
                height={TEX_HEIGHT * 3}
                alpha={0} />
            <Latex
                ref={REF_RATIO_0_W}
                tex={LATEX`${CLRT.WHITE}\frac{A+B}{A}`}
                height={TEX_HEIGHT * 3}
                alpha={0}
            />
            <Latex
                ref={REF_RATIO_1}
                tex={LATEX`${CLRT.WHITE}=`}
                height={TEX_HEIGHT}
                x={150}
                y={6}
                alpha={0} />
            <Latex
                ref={REF_RATIO_2_C}
                tex={LATEX`${CLRT.WHITE}\frac{${CLRT.CAT.B}A}{${CLRT.CAT.E}B}`}
                height={TEX_HEIGHT * 3}
                x={240}
                alpha={0} />
            <Latex
                ref={REF_RATIO_2_W}
                tex={LATEX`${CLRT.WHITE}\frac{A}{B}`}
                height={TEX_HEIGHT * 3}
                x={240}
                alpha={0}
            />
            <Latex
                ref={REF_RATIO_3}
                tex={LATEX`${CLRT.WHITE}=`}
                height={TEX_HEIGHT}
                x={330}
                y={6}
                alpha={0}
            />
            <Latex
                ref={REF_RATIO_4}
                tex={LATEX`${CLRT.WHITE}\Phi`}
                height={TEX_HEIGHT * 1.5}
                x={410}
                y={6}
                alpha={0}
            />
            <Text
                ref={REF_RATIO_5}
                text={"Golden Ratio"}
                fill={CLR.WHITE}
                x={175}
                y={-200}
                fontSize={80}
                fontWeight={500}
                fontFamily={"overpass"}
                opacity={0}
            />
        </>
    )

    yield* REF_RECT_0().end(1, line_draw_time(REF_RECT_0), linear)
    yield* REF_RECT_1().end(1, line_draw_time(REF_RECT_1), linear)
    yield* REF_RECT_2().end(1, line_draw_time(REF_RECT_2), linear)
    yield* REF_RECT_3().end(1, line_draw_time(REF_RECT_3), linear)
    yield* REF_RECT_4().end(1, line_draw_time(REF_RECT_4), linear)
    yield* REF_RECT_5().end(1, line_draw_time(REF_RECT_5), linear)

    yield* REF_LABEL_A().alpha(1, 1)
    yield* all(
        REF_LABEL_APB_A().alpha(1, 1),
        REF_LABEL_APB_B().alpha(1, 1),
        REF_LABEL_APB_P().alpha(1, 1),
    )

    yield* REF_LINE_0().end(1, 2 * line_draw_time(REF_LINE_0), linear);

    yield* all(
        REF_LABEL_APB_A().position.x(A / 2, 2),
        REF_LABEL_APB_P().alpha(0, 1),
        REF_LABEL_APB_B().position.x(A + B / 2, 2),
    )

    yield* REF_PLOT().position.x(-Z / 2 - 300, 2)

    yield* REF_RECT_4().stroke(CLR.CAT.E, 1)
    yield* REF_RECT_5().stroke(CLR.CAT.B, 1)
    yield* REF_RATIO_0_C().alpha(1, 1)
    yield* waitFor(1)

    yield* all(
        REF_RECT_4().stroke(CLR.WHITE, 1),
        REF_RECT_5().stroke(CLR.WHITE, 1),
        REF_RATIO_0_C().alpha(0, 1),
        REF_RATIO_0_W().alpha(1, 1),
    )

    yield* REF_LINE_0().stroke(CLR.CAT.E, 1)
    yield* REF_RECT_1().stroke(CLR.CAT.B, 1)

    yield* all(
        REF_TEXT().position.x(Z / 2 + 20, 2),
        REF_RATIO_1().alpha(0, 1).to(1, 1),
        REF_RATIO_2_C().alpha(0, 1).to(1, 1),
    )
    yield* waitFor(1)

    yield* all(
        REF_RATIO_2_C().alpha(0, 1),
        REF_RATIO_2_W().alpha(1, 1),
        REF_LINE_0().stroke(CLR.WHITE, 1),
        REF_RECT_1().stroke(CLR.WHITE, 1),
    )
    yield* waitFor(2)

    yield* all(
        REF_TEXT().position.x(Z / 2 - 60, 2),
        REF_RATIO_3().alpha(0, 1).to(1, 1),
        REF_RATIO_4().alpha(0, 1).to(1, 1),
    )
    yield* waitFor(2)

    yield* all(
        REF_TEXT().position.y(100, 2),
        REF_RATIO_5().opacity(0, 1).to(1, 1),
    )
    yield* waitFor(2)

    yield* all(
        REF_PLOT().position.x(-Z / 2, 2),
        REF_RATIO_0_W().alpha(0, 1),
        REF_RATIO_1().alpha(0, 1),
        REF_RATIO_2_W().alpha(0, 1),
        REF_RATIO_3().alpha(0, 1),
        REF_RATIO_4().alpha(0, 1),
        REF_RATIO_5().opacity(0, 1),
    )

    for (let ref_line of REF_LINES) {
        yield* ref_line().end(1, 2 * line_draw_time(REF_LINE_1), linear);
    }
    yield* waitFor(2);

    yield* all(
        REF_RECT_0().stroke(CLR.GREY, 1),
        REF_RECT_1().stroke(CLR.GREY, 1),
        REF_RECT_2().stroke(CLR.GREY, 1),
        REF_RECT_3().stroke(CLR.GREY, 1),
        REF_RECT_4().stroke(CLR.GREY, 1),
        REF_RECT_5().stroke(CLR.GREY, 1),
        REF_LINE_0().stroke(CLR.GREY, 1),
        REF_LINE_1().stroke(CLR.GREY, 1),
        REF_LINE_2().stroke(CLR.GREY, 1),
        REF_LINE_3().stroke(CLR.GREY, 1),
        REF_LINE_4().stroke(CLR.GREY, 1),
        REF_LINE_5().stroke(CLR.GREY, 1),
        REF_LINE_6().stroke(CLR.GREY, 1),
        REF_LINE_7().stroke(CLR.GREY, 1),
    )
    yield* waitFor(2);

    yield* REF_CIRCLE_0().endAngle(270, 2 * circle_draw_time(REF_CIRCLE_0().height() / 2), linear);
    yield* waitFor(2);

    for (let i = 1; i < REF_CIRCLES.length; i++) {
        const ref = REF_CIRCLES[i]()
        yield* ref.endAngle(270 + 90 * i, 2 * circle_draw_time(ref.height() / 2), linear);
    }
    yield* waitFor(2);

    yield* all(
        REF_RECT_0().opacity(0, 1),
        REF_RECT_1().opacity(0, 1),
        REF_RECT_2().opacity(0, 1),
        REF_RECT_3().opacity(0, 1),
        REF_RECT_4().opacity(0, 1),
        REF_RECT_5().opacity(0, 1),
        REF_LINE_0().opacity(0, 1),
        REF_LINE_1().opacity(0, 1),
        REF_LINE_2().opacity(0, 1),
        REF_LINE_3().opacity(0, 1),
        REF_LINE_4().opacity(0, 1),
        REF_LINE_5().opacity(0, 1),
        REF_LINE_6().opacity(0, 1),
        REF_LINE_7().opacity(0, 1),
        REF_LABEL_A().alpha(0, 1),
        REF_LABEL_APB_A().alpha(0, 1),
        REF_LABEL_APB_B().alpha(0, 1),
        REF_LABEL_APB_P().alpha(0, 1),
    )
    yield* waitFor(2);

});
