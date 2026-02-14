import Chart from 'react-apexcharts';
import type { StockComponentProps } from '../types/pimTypes';
import type { ApexOptions } from 'apexcharts';
import { useMutation } from "@tanstack/react-query";
import { postDataToPIM } from "../api/python";
import { formatStockData, handlePIMPrediction } from './PIMDataUtils';
import "../styles/PIM.css";

function StockComponent({
    stock,
    color,
    globalNews,
    week
}: StockComponentProps) {
    const options: ApexOptions = {
        colors: [color],
        chart: {
            id: stock.companyName
        },
        dataLabels: {
            enabled: false
        },
        fill: {
            type: 'gradient',
            colors: [color],
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
        name: `${stock.companyName} Stock`,
        data: stock.data
    }];

    const PIMMutation = useMutation({
        mutationFn: postDataToPIM,
        onSuccess: async (data: number[]) => {
            handlePIMPrediction(data)
        },
        onError: (error: any) => {
            const msg = error instanceof Error ? error.message : "Unknown error occurred";
            console.error(msg);
        },
    });

    const askPIM = () => {
        PIMMutation.mutate(formatStockData(stock, globalNews, week));
    };

    return (
        <section className='stock'>
            <h3>{stock.companyName}</h3>
            <div className='stock-chart'>
                <Chart
                    options={options}
                    series={series}
                    type="area"
                    width={550}
                    height={150}
                />
            </div>
            <button onClick={askPIM}>Ask PIM</button>
        </section>
    );
}

export default StockComponent;