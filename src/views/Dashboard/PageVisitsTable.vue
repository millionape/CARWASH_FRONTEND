<template>
  <b-card body-class="p-0" header-class="border-0">
    <template v-slot:header>
      <b-row align-v="center">
        <b-col>
          <h3 class="mb-0">Device current states</h3>
        </b-col>
        <!-- <b-col class="text-right">
          <a href="#!" class="btn btn-sm btn-primary">See all</a>
        </b-col> -->
      </b-row>
    </template>

    <el-table
      class="table-responsive table"
      :data="tableData"
      header-row-class-name="thead-light"
    >
      <el-table-column label="Device Id" min-width="90px" prop="deviceId">
        <template v-slot="{ row }">
          <div class="font-weight-600">{{ row.deviceId }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="Updated Date"
        min-width="180px"
        prop="updatedDate"
      >
      </el-table-column>
      <el-table-column label="Selected Mode" min-width="150px" prop="onMode">
      </el-table-column>

      <el-table-column label="Credit" min-width="150px" prop="currentCredit">
        <template v-slot="{ row }">
          {{ row.currentCredit }}
        </template>
      </el-table-column>
      <el-table-column
        label="Last inserted credit"
        min-width="150px"
        prop="lastInsertCredit"
      >
      </el-table-column>
    </el-table>
  </b-card>
</template>
<script>
import axios from "axios";
import moment from "moment";
import { SERVER_PARAMS } from '../../environment/environment';

import {
  Table,
  TableColumn,
  DropdownMenu,
  DropdownItem,
  Dropdown,
} from "element-ui";
export default {
  name: "page-visits-table",
  components: {
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Dropdown.name]: Dropdown,
    [DropdownItem.name]: DropdownItem,
    [DropdownMenu.name]: DropdownMenu,
  },
  data() {
    return {
      polling: null,
      SERVER_URL: SERVER_PARAMS.URL,
      tableData: [
        {
          page: "/argon/",
          visitors: "4,569",
          unique: "340",
          bounceRate: "46,53%",
        },
        {
          page: "/argon/index.html",
          visitors: "3,985",
          unique: "319",
          bounceRate: "46,53%",
        },
        {
          page: "/argon/charts.html",
          visitors: "3,513",
          unique: "294",
          bounceRate: "36,49%",
        },
        {
          page: "/argon/tables.html",
          visitors: "2,050",
          unique: "147",
          bounceRate: "50,87%",
        },
        {
          page: "/argon/profile.html",
          visitors: "1,795",
          unique: "190",
          bounceRate: "46,53%",
        },
      ],
    };
  },
  methods: {
    async getCurrentStates() {
      await axios
        .get(`${this.SERVER_URL}/getDeviceBySite?site=Rayong-1`)
        .then((response) => {
          console.log("DEVICES lIST ", response);
          this.tableData = [];
          if (response.data.length > 0) {
            this.tableData = response.data;
          }
        })
        .catch((e) => {
          console.log("ERROR |", e);
        });
    },
    pollData () {
		this.polling = setInterval(() => {
			this.getCurrentStates();
		}, 2000)
	}
  },
  async created() {
    await this.getCurrentStates();
  },
  beforeDestroy() {
    clearInterval(this.polling);
  },
  created() {
    this.pollData();
  },
};
</script>
<style></style>
