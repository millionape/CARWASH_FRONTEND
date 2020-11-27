<template>
  <div>
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <!-- Card stats -->
      <b-row>
        <b-col xl="3" md="6">
          <stats-card
            title="Total income in this year"
            type="gradient-info"
            sub-title="49,65%"
            icon="ni ni-chart-bar-32"
            class="mb-4"
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
            class="mb-4"
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
            class="mb-4"
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
            class="mb-4"
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
        <b-col xl="7" class="mb-5 mb-xl-0">
          <card header-classes="bg-transparent">
            <b-row align-v="center" slot="header">
              <b-col>
                <h6 class="text-uppercase text-muted ls-1 mb-1">Income</h6>
                <h5 class="h3 mb-0">Current income in last 7 days</h5>
              </b-col>
              <b-col>
                <b-nav class="nav-pills justify-content-end">
                  <b-nav-item
                    class="mr-2 mr-md-0"
                    link-classes="py-2 px-3"
                    @click.prevent="initBigChart(0)"
                  >
                    <span class="d-none d-md-block">Month</span>
                    <span class="d-md-none">M</span>
                  </b-nav-item>
                  <b-nav-item
                    link-classes="py-2 px-3"
                    @click.prevent="initBigChart(1)"
                  >
                    <span class="d-none d-md-block">Week</span>
                    <span class="d-md-none">W</span>
                  </b-nav-item>
                </b-nav>
              </b-col>
            </b-row>
            <canvas style="height:350px;" id="big-chart"></canvas>
          </card>
        </b-col>

        <b-col xl="5" class="mb-5 mb-xl-0">
          <card header-classes="bg-transparent" class="h-100">
            <b-row align-v="center" slot="header">
              <b-col>
                <h6 class="text-uppercase text-muted ls-1 mb-1">Income</h6>
                <h5 class="h3 mb-0">Current income by devices</h5>
              </b-col>
            </b-row>

            <canvas style="height:100%; width:100%" id="my-chart"></canvas>
          </card>
        </b-col>
      </b-row>
      <!-- End charts-->

      <!--Tables-->
      <b-row class="mt-5">
        <b-col xl="8" class="mb-5 mb-xl-0">
          <page-visits-table></page-visits-table>
        </b-col>
        <b-col xl="4" class="mb-5 mb-xl-0">
          <social-traffic-table></social-traffic-table>
        </b-col>
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

export default {
  components: {
    LineChart,
    BaseProgress,
    StatsCard,
    PageVisitsTable,
    SocialTrafficTable
  },
  data() {
    return {
      SERVER_URL: "http://192.168.1.72:3000",
      day_total: 0,
      month_total: 0,
      seven_day_total: 0,
      barChartRender: false,
      bigLineChart: {
        activeIndex: 0,
        chartData: {
          datasets: [
            {
              label: "Performance",
              data: [0, 20, 10, 30, 15, 40, 20, 60, 60]
            }
          ],
          labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        },
        extraOptions: chartConfigs.blueChartOptions
      },
      redBarChart: {
        chartData: {
          labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Sales",
              data: [25, 20, 30, 22, 17, 29]
            }
          ]
        },
        extraOptions: chartConfigs.blueChartOptions
      }
    };
  },
  methods: {
    initBigChart(index) {
      let chartData = {
        datasets: [
          {
            label: "Performance",
            data: this.bigLineChart.allData[index]
          }
        ],
        labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      };
      this.bigLineChart.chartData = chartData;
      this.bigLineChart.activeIndex = index;
    },
    numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    async getTotalIncome_day() {
      var m = moment();
      m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      let date = moment(m).format("YYYY-MM-DD HH:mm:ss");
      await axios
        .get(
          `${this.SERVER_URL}/getTotalIncomeInDay?site=Chantaburi-1&sdate=${date}`
        )
        .then(response => {
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
        .catch(e => {
          console.log("ERROR |", e);
        });
    },
    async getTotalIncome_last_7_days() {
      var m = moment();
      m = m.subtract(7, "days");
      m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
      let date = moment(m).format("YYYY-MM-DD HH:mm:ss");
      await axios
        .get(
          `${this.SERVER_URL}/getTotalIncomeInDay?site=Chantaburi-1&sdate=${date}`
        )
        .then(response => {
          console.log(response);
          this.seven_day_total = 0;
          if (response.data.length > 0) {
            for (let transection of response.data) {
              this.seven_day_total += transection.insertedCredit;
            }
            console.log("seven_day_total : ", this.seven_day_total);
            var grouped = _.groupBy(response.data, function(item) {
              return moment(item.updatedDate).format("YYYY-MM-DD");
            });
            console.log("GROUPED ITEMS :", grouped);
            this.bigLineChart.chartData.labels = [];
            this.bigLineChart.chartData.datasets = [];
            for (let key in grouped) {
              this.bigLineChart.chartData.labels.push(key);
              let tmp_counter = 0;
              console.log("push key :", key);
              for (let items of grouped[key]) {
                tmp_counter += items.insertedCredit;
                // console.log("add money :",tmp_counter);
              }
              this.bigLineChart.chartData.datasets.push(tmp_counter);
            }
          }
        })
        .catch(e => {
          console.log("ERROR |", e);
        });
    },
    async getTotalIncome_month() {
      const startOfMonth = moment()
        .startOf("month")
        .format("YYYY-MM-DD HH:mm:ss");
      await axios
        .get(
          `${this.SERVER_URL}/getTotalIncomeInDay?site=Chantaburi-1&sdate=${startOfMonth}`
        )
        .then(response => {
          console.log(response);
          this.month_total = 0;
          if (response.data.length > 0) {
            for (let transection of response.data) {
              this.month_total += transection.insertedCredit;
            }
            console.log("month_total : ", this.month_total);
          }
        })
        .catch(e => {
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
              maxBarThickness: 2
            }
          ]
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
              fill: true
            }
          ]
        },
        options: {
          responsive: true
        }
      });
    },
    initTotalChart() {
      var ctx = document.getElementById("big-chart");
      var myChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.bigLineChart.chartData.labels,
          datasets: [
            {
              label: "Income",
              data: this.bigLineChart.chartData.datasets,
              borderColor: "#6E7EF5",
              fill: false
            }
          ]
        },
        options: {
          responsive: true
        }
      });
    }
  },
  mounted() {
    this.initBigChart(0);
  },
  async created() {
    await this.getTotalIncome_day();
    await this.getTotalIncome_month();
    await this.getTotalIncome_last_7_days();
    this.initTotalChart();
    this.initDevicesChart();
  }
};
</script>
<style>
.el-table .cell {
  padding-left: 0px;
  padding-right: 0px;
}
</style>
