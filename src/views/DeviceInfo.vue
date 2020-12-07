<template>
  <div class="mt-3">
    <card header-classes="bg-transparent mt-3">
      <h3 class="mb-0">Current state</h3>
      <b-row class="mt-3">
        <b-col>
          <stats-card
            title="Current Credit"
            type="gradient-info"
            :sub-title="deviceCurrentCredit"
          >
          </stats-card>
        </b-col>
        <b-col>
          <stats-card
            title="Current Mode"
            type="gradient-info"
            :sub-title="deviceMode"
          >
          </stats-card>
        </b-col>
        <b-col>
          <stats-card
            title="Last Inserted Credit"
            type="gradient-info"
            :sub-title="deviceLastInsertCredit"
          >
          </stats-card>
        </b-col>
        <b-col>
          <stats-card
            title="Last Inserted Date"
            type="gradient-info"
            :sub-title="deviceLastInsertDate"
          >
          </stats-card>
        </b-col>
        <b-col>
          <stats-card
            title="Last Update"
            type="gradient-info"
            :sub-title="deviceUpdatedDate"
          >
          </stats-card>
        </b-col>
      </b-row>
    </card>
    <br />
    <card header-classes="bg-transparent">
      <h3 slot="header" class="mb-0">Event List</h3>
      <vue-good-table
        :columns="columns"
        :rows="rows"
        :pagination-options="{
          enabled: true,
          mode: 'pages',
          perPage: 10,
          perPageDropdown: [50, 100, 300, 1000],
        }"
      />
    </card>
  </div>
</template>
<script>
import Vue from "vue";
import axios from "axios";
import moment from "moment";
import { SERVER_PARAMS } from "../environment/environment";

export default {
  name: "icons",
  props: {
    deviceId: String,
  },
  data() {
    return {
      deviceMode: null,
      deviceCurrentCredit: null,
      deviceLastInsertCredit: null,
      deviceLastInsertDate: null,
      deviceUpdatedDate: null,
      deviceList: [],
      polling: null,
      SERVER_URL: SERVER_PARAMS.URL,
      columns: [
        {
          label: "Updated Date",
          field: "updatedDate",
        },
        {
          label: "Device Id",
          field: "deviceId",
        },
        {
          label: "Mode",
          field: "onMode",
        },
        {
          label: "Credit",
          field: "currentCredit",
        },
        {
          label: "Inserted Credit",
          field: "insertedCredit",
        },
      ],
      rows: [],
    };
  },
  methods: {
    pollData() {
      this.polling = setInterval(() => {
        this.getCurrentStates();
      }, 2000);
    },
    async getCurrentStates() {
      await axios
        .get(`${this.SERVER_URL}/getDeviceCurrentStatus?deviceId=${this.deviceId}`)
        .then((response) => {
          console.log("DEVICES info ", response);
          let data = response.data[0];
          this.deviceMode = data.onMode;
          this.deviceCurrentCredit = data.currentCredit;
          this.deviceLastInsertCredit = data.lastInsertCredit;
          this.deviceLastInsertDate = data.lastInsertDate;
          this.deviceUpdatedDate = data.updatedDate;
        })
        .catch((e) => {
          console.log("ERROR |", e);
        });
    },
    async getHistory(deviceId) {
      let loader = this.$loading.show({
        // Optional parameters
        color: "blue",
        canCancel: true,
      });
      var sdate = moment()
        .subtract(7, "days")
        .format("YYYY-MM-DD HH:mm:ss");
      var edate = moment().format("YYYY-MM-DD HH:mm:ss");
      await axios
        .get(
          `${this.SERVER_URL}/getTransectionByDeviceId?deviceId=${deviceId}&sdate=${sdate}&edate=${edate}&limit=2000`
        )
        .then((response) => {
          console.log("HISTORY lIST ", response);
          this.rows = response.data;
          loader.hide();
        })
        .catch((e) => {
          console.log("ERROR |", e);
          loader.hide();
        });
    },
  },
   beforeDestroy() {
    clearInterval(this.polling);
  },
  
  created() {
    this.getHistory(this.deviceId);
    this.pollData();
  },
};
</script>
<style></style>
