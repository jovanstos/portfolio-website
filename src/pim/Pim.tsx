import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

/*
- Company News -1 - 1
- Global News -1 - 1
- Momentum Volume brought 70 > too much buying < 30 too little buying 0-100
- Moving Averages, distance between current price and average 
if average is 50 stock is 100, the stock is too high, current price - average
- Social Buzz 0 - 100. 100 many people talking 0 no one cares. If news bad and 100 tanks
if news good and 100 jumps
- Volatility Risk 0-100 Per Stock How much does it swing. 100 could go up 25% down 25% 0 1-3% changes
- P/E (Price-to-Earings) Ratio 0-100. 100 price is high earings low, 0 price cheap earings high
*/

// P.I.M. stands for predictive investment model
function PIM() {

    // Typings for seriesData help prevent issues with nested arrays
    const seriesData: [number, number][] = [
        [new Date('2025-10-01').getTime(), 30],
        [new Date('2025-10-02').getTime(), 35],
        [new Date('2025-10-03').getTime(), 32],
        [new Date('2025-10-04').getTime(), 40],
        [new Date('2025-10-05').getTime(), 38],
        [new Date('2025-10-06').getTime(), 45],
        [new Date('2025-10-07').getTime(), 50]
    ];

    const options: ApexOptions = {
        chart: {
            id: 'apexchart-example'
        },
        dataLabels: {
            enabled: false
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 0,
                stops: [0, 90, 100]
            },
        },
        xaxis: {
            type: "datetime"
        },
        yaxis: {
            labels: {
                formatter: function (val: number) {
                    return val.toFixed(0);
                },
            },
            title: {
                text: 'Price'
            },
        },
        tooltip: {
            shared: false,
            y: {
                formatter: function (val: number) {
                    return val.toFixed(0);
                }
            }
        }
    };

    const series = [{
        name: 'Investment Prediction',
        data: seriesData
    }];

    return (
        <Chart
            options={options}
            series={series}
            type="area"
            width={500}
            height={320}
        />
    );
}

export default PIM;