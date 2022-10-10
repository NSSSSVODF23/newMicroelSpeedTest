import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnInit,
    Output,
    ViewChild,
} from "@angular/core";
import {
    combineLatest,
    delay,
    forkJoin,
    map,
    Observable,
    pairwise,
    Subject,
    Subscription,
    zip,
} from "rxjs";

export class SpeedChartPoint {
    stamp: number;
    speed: number;

    constructor(stamp: number, value: number) {
        this.stamp = stamp;
        this.speed = value;
    }
}

@Component({
    selector: "app-speed-chart",
    templateUrl: "./speed-chart.component.html",
    styleUrls: ["./speed-chart.component.scss"],
})
export class SpeedChartComponent implements OnInit, AfterViewInit {
    @ViewChild("chart") canvas!: ElementRef<HTMLCanvasElement>;
    ctx: CanvasRenderingContext2D | null = null;
    dataSubscription: Subscription | null = null;
    @Input() viewInterval: number = 15000; // Time interval in milliseconds of viewing graphics
    @Input() shifted = false;
    @Input() stroke: string[] = [];
    @Input() fill: string[] = [];
    @Input() sized: "auto" | "width" | "height" = "auto";
    @Input() ratio?: number;

    constructor() {
    }

    private _chartData: SpeedChartPoint[][] = [];

    @Input() set chartData(data: SpeedChartPoint[][]) {
        this._chartData = data;
        this.redraw();
    }

    clearCanvas = () => {
        if (this.canvas && this.ctx) {
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(
                0,
                0,
                this.canvas.nativeElement.width,
                this.canvas.nativeElement.height,
            );
            this.ctx.restore();
        }
    };

    getFillStyle = (ctx: CanvasRenderingContext2D, color: string) => {
        const gradient = ctx.createLinearGradient(
            0,
            -this.canvas.nativeElement.height * 2,
            0,
            this.canvas.nativeElement.height,
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "white");
        return gradient;
    };

    // Get biggest stamp value from all data sets arrays
    getLastTimestamp = (pointsArray: SpeedChartPoint[][]) => {
        let max = 0;
        pointsArray.forEach((data) => {
            if (data.length > 0) {
                max = Math.max(max, data[data.length - 1].stamp);
            }
        });
        return max;
    };

    // Get the value of the shift relative to X when the schedule fills the entire canvas area
    getShift = (pointsArray: SpeedChartPoint[][], xFactor: number) => {
        const lastTimestamp = this.getLastTimestamp(pointsArray);
        const shift = (lastTimestamp - this.viewInterval) * xFactor;
        return shift;
    };

    getXFactor = () => {
        return this.canvas?.nativeElement.width / this.viewInterval;
    };

    getYFactor = (apex: number) => {
        return apex > 0 ? (this.canvas?.nativeElement.height - 10) / apex : 0;
    };

    getApex = (pointsArray: SpeedChartPoint[][]) => {
        return Math.max(
            ...pointsArray.map((data) => Math.max(...data.map((d) => d.speed))),
        );
    };

    draw = (pointsArray: SpeedChartPoint[][]) => {
        const apex = this.getApex(pointsArray);
        const xFactor = this.getXFactor();
        const yFactor = this.getYFactor(apex);

        if (
            this.shifted &&
            this.getLastTimestamp(pointsArray) > this.viewInterval
        ) {
            const shift = this.getShift(pointsArray, xFactor);
            this.ctx?.setTransform(1, 0, 0, 1, -shift, 0);
        }

        this.clearCanvas(); // Walk through all data sets and draw them

        pointsArray.forEach((data, index) => {
            if (this.ctx) {
                if (data.length === 0) return;
                this.ctx.globalAlpha =
                    (1 / pointsArray.length) * (pointsArray.length - index);
                this.ctx.beginPath();
                this.ctx.strokeStyle = this.stroke[index] ? this.stroke[index] : "red";
                this.ctx.fillStyle = this.getFillStyle(
                    this.ctx,
                    this.fill[index] ? this.fill[index] : "red",
                );
                this.ctx.lineWidth = 1;
                this.ctx.moveTo(-1, this.canvas?.nativeElement.height);
                this.ctx.lineTo(
                    -1,
                    this.canvas?.nativeElement.height - data[0].speed * yFactor - 5,
                );
                data.forEach((d) => {
                    this.ctx?.lineTo(
                        d.stamp * xFactor,
                        this.canvas?.nativeElement.height - d.speed * yFactor - 5,
                    );
                });
                this.ctx.stroke();
                this.ctx.lineTo(
                    data[data.length - 1].stamp * xFactor,
                    this.canvas?.nativeElement.height,
                );
                this.ctx.fill();
            }
        });
    };

    viewResize = () => {
        if (this.canvas) {
            this.canvas.nativeElement.width = this.canvas.nativeElement.offsetWidth;
            this.canvas.nativeElement.height = this.canvas.nativeElement.offsetHeight;
        }
    };

    redraw = () => {
        this.viewResize();
        this.draw(this._chartData);
    };

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.ctx = this.canvas.nativeElement.getContext("2d");
        this.canvas.nativeElement.width = 692;
        this.canvas.nativeElement.height = 300;
        this.redraw();
    }

    ngOnDestroy(): void {
        this.dataSubscription?.unsubscribe();
    }
}
