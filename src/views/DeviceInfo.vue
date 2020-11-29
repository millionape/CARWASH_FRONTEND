<template>
  <div>
    <card header-classes="bg-transparent">
      <h3 slot="header" class="mb-0">Event List</h3>
      <vue-good-table
      :columns="columns"
      :rows="rows"
      :pagination-options="{
            enabled: true,
            mode: 'pages',
            perPage: 10,
            perPageDropdown: [50, 100, 300,1000]
        }"
      />
    </card>
  </div>
</template>
<script>
import Vue from "vue";
import axios from "axios";
import moment from "moment";

export default {
  name: "icons",
  props:{
    deviceId: String
  },
  data() {
    return {
      deviceList: [],
      polling: null,
      SERVER_URL: "http://0.0.0.0:3000",
      columns: [
        {
          label: 'Updated Date',
          field: 'updatedDate',          
        },
        {
          label: 'Device Id',
          field: 'deviceId',
        },
        {
          label: 'Mode',
          field: 'onMode',
        },
        {
          label: 'Credit',
          field: 'currentCredit',
        },
        {
          label: 'Inserted Credit',
          field: 'insertedCredit',
        },
      ],
      rows:[]
    };
  },
  methods: {
    async getHistory(deviceId) {
      let loader = this.$loading.show({
      // Optional parameters
      color: 'blue',
      canCancel: true,
    });
    var sdate = moment().subtract(7, "days").format("YYYY-MM-DD HH:mm:ss");
    var edate = moment().format("YYYY-MM-DD HH:mm:ss");
      await axios
        .get(`${this.SERVER_URL}/getTransectionByDeviceId?deviceId=${deviceId}&sdate=${sdate}&edate=${edate}&limit=2000`)
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
  created() {
    this.getHistory(this.deviceId);
  },
};
</script>
<style></style>
