import Chart from "react-apexcharts";
import type { StockChartProps } from "../../types/pimTypes";
import type { ApexOptions } from "apexcharts";
import "../../styles/PIM.css";

function StockChart({ stock, color, width, height, tooltip }: StockChartProps) {
  const options: ApexOptions = {
    colors: [color],
    chart: {
      id: stock.name,
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: "gradient",
      colors: [color],
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      labels: {
        formatter: function (val: number) {
          return val.toFixed(0);
        },
      },
      title: {
        text: "Price",
      },
    },
    tooltip: {
      enabled: tooltip,
      shared: false,
      y: {
        formatter: function (val: number) {
          return val.toFixed(0);
        },
      },
    },
  };

  const series = [
    {
      name: `${stock.name} Chart`,
      data: stock.data,
    },
  ];

  return (
    <div className="stock-chart">
      <Chart
        options={options}
        series={series}
        type="area"
        width={width}
        height={height}
      />
    </div>
  );
}

export default StockChart;
