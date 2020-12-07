<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <!-- Card stats -->
      <b-row>
        <b-col xl="3" md="6">
          <stats-card
            title="Total income in this year"
            type="gradient-info"
            :sub-title="String(numberWithCommas(year_total)) + ' BTH'"
            icon="ni ni-chart-bar-32"
            class="mb-4 statusCard"
          >
            <template slot="footer">
              <!-- <span class="text-success mr-2">54.8%</span>
              <span class="text-nowrap">Since last month</span> -->
            </template>
          </stats-card>
        </b-col>
        <b-col xl="3" md="6">
          <stats-card
            title="Total income in this month"
            type="gradient-red"
            :sub-title="String(numberWithCommas(month_total)) + ' BTH'"
            icon="ni ni-active-40"
            class="mb-4 statusCard"
          >
            <template slot="footer">
              <!-- <span class="text-success mr-2">3.48%</span>
              <span class="text-nowrap">Total income in this month</span> -->
            </template>
          </stats-card>
        </b-col>
        <b-col xl="3" md="6">
          <stats-card
            title="Total income in last 7 days"
            type="gradient-orange"
            :sub-title="String(numberWithCommas(seven_day_total)) + ' BTH'"
            icon="ni ni-chart-pie-35"
            class="mb-4 statusCard"
          >
            <template slot="footer">
              <!-- <span class="text-success mr-2">12.18%</span>
              <span class="text-nowrap">Total income in last 7 days</span> -->
            </template>
          </stats-card>
        </b-col>
        <b-col xl="3" md="6">
          <stats-card
            title="Current income in this day"
            type="gradient-green"
            :sub-title="String(numberWithCommas(day_total)) + ' BTH'"
            icon="ni ni-money-coins"
            class="mb-4 statusCard"
          >
            <template slot="footer">
              <!-- <span class="text-danger mr-2">5.72%</span>
              <span class="text-nowrap">Since last month</span> -->
            </template>
          </stats-card>
        </b-col>
      </b-row>
    </base-header>

    <!--Charts-->
    <b-container fluid class="mt--7">
      <b-row>
        <b-col xl="12" class="mb-5 mb-xl-0">
          <card header-classes="bg-transparent" class="h-100 graphCard">
            <b-row align-v="center" slot="header">
              <b-col>
                <h6 class="text-uppercase text-muted ls-1 mb-1">Income</h6>
                <h5 class="h3 mb-0">Current income by devices</h5>
              </b-col>
            </b-row>

            <canvas style="height:100%; width:100%" id="my-chart"></canvas>
          </card>
        </b-col>
        <br />
        <br />
        <b-col xl="12" class="mb-5 mt-5 mb-xl-0">
          <card header-classes="bg-transparent" class="graphCard">
            <b-row align-v="center" slot="header">
              <b-col>
                <h6 class="text-uppercase text-muted ls-1 mb-1">Income</h6>
                <h5 class="h3 mb-0">Total Income Graph</h5>
              </b-col>
              <b-col>
                <b-nav class="nav-pills justify-content-end">
                  <b-nav-item
                    class="mr-2 mr-md-0"
                    link-classes="py-2 px-3"
                    @click.prevent="initTotalChart()"
                  >
                    <span class="d-none d-md-block">Week</span>
                    <span class="d-md-none">W</span>
                  </b-nav-item>
                  <b-nav-item
                    link-classes="py-2 px-3"
                    @click.prevent="initTotalChart2()"
                  >
                    <span class="d-none d-md-block">Month</span>
                    <span class="d-md-none">Y</span>
                  </b-nav-item>
                </b-nav>
              </b-col>
            </b-row>
            <div style="height:100%; width:100%" id="chartContainer">
              <canvas
                style="height:100% !important; width:100% !important"
                id="big-chart"
              ></canvas>
            </div>
          </card>
        </b-col>
      </b-row>
      <!-- End charts-->

      <!--Tables-->
      <b-row class="mt-5">
        <b-col xl="12" class="mb-5 mb-xl-0">
          <page-visits-table></page-visits-table>
        </b-col>
        <!-- <b-col xl="4" class="mb-5 mb-xl-0">
          <social-traffic-table></social-traffic-table>
        </b-col> -->
      </b-row>
      <!--End tables-->
    </b-container>
  </div>
</template>
<script>
import axios from "axios";
import moment from "moment";
import _ from "lodash";
// Charts
import * as chartConfigs from "@/components/Charts/config";
import LineChart from "@/components/Charts/LineChart";
import Chart from "chart.js";

// Components
import BaseProgress from "@/components/BaseProgress";
import StatsCard from "@/components/Cards/StatsCard";

// Tables
import SocialTrafficTable from "./Dashboard/SocialTrafficTable";
import PageVisitsTable from "./Dashboard/PageVisitsTable";
import { SERVER_PARAMS } from "../environment/environment";

export default {
  components: {
    LineChart,
    BaseProgress,
    StatsCard,
    PageVisitsTable,
    SocialTrafficTable,
  },
  data() {
    return {
      SERVER_URL: SERVER_PARAMS.URL,
      // SERVER_URL: "http://0.0.0.0:3000",
      day_total: 0,
      month_total: 0,
      seven_day_total: 0,
      year_total: 0,
      chartTypeSelected: "month",
      myChart: null,
      barChartRender: false,
      bigLineChart: {
        activeIndex: 0,
        chartData: {
          datasets: [
            {
              label: "Performance",
              data: [0, 20, 10, 30, 15, 40, 20, 60, 60],
            },
          ],
          labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        },
        extraOptions: chartConfigs.blueChartOptions,
      },
      redBarChart: {
        chartData: {
          labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Sales",
              data: [25, 20, 30, 22, 17, 29],
            },
          ],
        },
        extraOptions: chartConfigs.blueChartOptions,
      },
      monthChart: {
        labels: [],
        data: [],
      },
      yearChart: {
        labels: [],
        data: [],
      },
    };
  },
  methods: {
    initBigChart(index) {
      let chartData = {
        datasets: [
          {
            label: "Performance",
            data: this.bigLineChart.allData[index],
          },
        ],
        labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      };
      this.bigLineChart.chartData = chartData;
      this.bigLineChart.activeIndex = index;
    },
    numberWithCommas(x) {
      if (x === null || x === undefined) {
        x = 0;
      }
      x = String(x);
      return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    async getTotalIncome_day() {
      var m = moment();
      m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      let date = moment(m).format("YYYY-MM-DD HH:mm:ss");
      await axios
        .get(
          `${this.SERVER_URL}/getTotalIncomeInDay?site=Rayong-1&sdate=${date}`
        )
        .then((response) => {
          console.log(response);
          this.day_total = 0;
          if (response.data.length > 0) {
            for (let transection of response.data) {
              this.day_total += transection.insertedCredit;
            }
            console.log("this day: ", this.day_total);
            var grouped = _.groupBy(response.data, function(item) {
              return item.deviceId;
            });
            this.redBarChart.chartData.labels = [];
            this.redBarChart.chartData.datasets = [];
            for (let key in grouped) {
              this.redBarChart.chartData.labels.push(key);
              let tmp_counter = 0;
              console.log("push key :", key);
              for (let items of grouped[key]) {
                tmp_counter += items.insertedCredit;
                // console.log("add money :",tmp_counter);
              }
              this.redBarChart.chartData.datasets.push(tmp_counter);
            }
            console.log("GROUPED ITEMS :", grouped);
          }
        })
        .catch((e) => {
          console.log("ERROR |", e);
        });
    },
    async getTotalIncome_last_7_days() {
      // var m = moment();
      // m = m.subtract(7, "days");
      // m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      let date = moment().format("YYYY-MM-DD HH:mm:ss");
      await axios
        .get(
          `${this.SERVER_URL}/getTotalIncomeLast7Days?site=Rayong-1&date=${date}`
        )
        .then((response) => {
          console.log("7days income :", response);
          this.seven_day_total = 0;
          this.monthChart.data = [];
          this.bigLineChart.chartData.datasets = [];
          if (response.data.length > 0) {
            for (let incomes of response.data) {
              this.seven_day_total += incomes.money;
              let income_date = moment()
                .date(incomes.day)
                .format("YYYY-MM-DD");
              this.monthChart.labels.push(income_date);
              this.monthChart.data.push(incomes.money);
              // this.bigLineChart.chartData.labels.push(income_date);
              // this.bigLineChart.chartData.datasets.push(incomes.money);
            }
          }
        })
        .catch((e) => {
          console.log("ERROR |", e);
        });
    },
    async getTotalIncome_year() {
      // var m = moment();
      // m = m.subtract(7, "days");
      // m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      let date = moment().format("YYYY-MM-DD HH:mm:ss");
      await axios
        .get(
          `${this.SERVER_URL}/getTotalIncomeThisYear?site=Rayong-1&date=${date}`
        )
        .then((response) => {
          console.log("7days income :", response);
          this.year_total = 0;
          // this.bigLineChart.chartData.labels = [];
          // this.bigLineChart.chartData.datasets = [];
          this.yearChart.labels = [];
          this.yearChart.data = [];
          if (response.data.length > 0) {
            for (let incomes of response.data) {
              this.year_total += incomes.money;
              console.log("year total: ", this.year_total);
              let income_date = moment(date)
                .set("month", incomes.month - 1)
                .format("YYYY-MM");
              // this.bigLineChart.chartData.labels.push(income_date);
              // this.bigLineChart.chartData.datasets.push(incomes.money);
              this.yearChart.data.push(incomes.money);
              this.yearChart.labels.push(income_date);
            }
          }
        })
        .catch((e) => {
          console.log("ERROR |", e);
        });
    },
    async getTotalIncome_month() {
      const startOfMonth = moment()
        .startOf("month")
        .format("YYYY-MM-DD HH:mm:ss");
      await axios
        .get(
          `${this.SERVER_URL}/getTotalIncomeInMonth?site=Rayong-1&sdate=${startOfMonth}`
        )
        .then((response) => {
          console.log(response);
          this.month_total = 0;
          if (response.data.length > 0) {
            this.month_total = response.data[0].money;
            console.log("month_total : ", this.month_total);
          }
        })
        .catch((e) => {
          console.log("ERROR |", e);
        });
    },
    initDevicesChart() {
      var ctx = document.getElementById("my-chart");
      var myChart = new Chart(ctx, {
        type: "bar",
        scales: {
          yAxes: [
            {
              maxBarThickness: 2,
            },
          ],
        },
        dataPointWidth: 20,
        data: {
          labels: this.redBarChart.chartData.labels,
          datasets: [
            {
              label: "Income",
              data: this.redBarChart.chartData.datasets,
              borderColor: "#6E7EF5",
              backgroundColor: "#E75F5B",
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
        },
      });
      myChart.update();
    },
    initTotalChart() {
      document.getElementById("chartContainer").innerHTML = "&nbsp;";
      document.getElementById("chartContainer").innerHTML = '<canvas style="height:100% !important; width:100% !important" id="big-chart"></canvas>';
      var ctx = document.getElementById("big-chart");
      if (this.myChart !== null) {
        this.myChart.destroy();
      }
      if (ctx !== null) {
        var myChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: this.monthChart.labels,
            datasets: [
              {
                label: "Income",
                data: this.monthChart.data,
                borderColor: "#6E7EF5",
                backgroundColor: "#6E7EF5",
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
          },
        });
        this.myChart = myChart;
      }
    },
    initTotalChart2() {
      document.getElementById("chartContainer").innerHTML = "&nbsp;";
      document.getElementById("chartContainer").innerHTML = '<canvas style="height:100% !important; width:100% !important" id="big-chart"></canvas>';
      var ctx = document.getElementById("big-chart");
      if (this.myChart !== null) {
        this.myChart.destroy();
      }
      if (ctx !== null) {
        var myChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: this.yearChart.labels,
            datasets: [
              {
                label: "Income",
                data: this.yearChart.data,
                borderColor: "#6E7EF5",
                backgroundColor: "#6E7EF5",
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
          },
        });
        this.myChart = myChart;
      }
    },
  },
  mounted() {
    this.initBigChart(0);
  },
  async created() {
    let loader = this.$loading.show({
      // Optional parameters
      color: "blue",
      canCancel: true,
    });
    await this.getTotalIncome_day();
    await this.getTotalIncome_month();
    await this.getTotalIncome_last_7_days();
    await this.getTotalIncome_year();
    this.initTotalChart();
    this.initDevicesChart();
    loader.hide();
  },
};
</script>
<style lang="scss">
.el-table .cell {
  padding-left: 0px;
  padding-right: 0px;
}
.graphCard {
  height: 600px !important;
}
.statusCard {
  height: 8rem !important;
}
</style>
