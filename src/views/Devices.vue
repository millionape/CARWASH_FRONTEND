<template>
  <div>
    <!-- BootstrapVue Done -->
    <base-header class="pb-6 pb-8 pt-5 pt-md-8 bg-gradient-success">
      <!-- Card stats -->
      <b-row> </b-row>
    </base-header>

    <b-container fluid class="mt--7">
      <b-row class="justify-content-center">
        <b-col lg="12">
          <card header-classes="bg-transparent">
            <h3 slot="header" class="mb-0">Device list</h3>
            <b-row class="icon-examples">
              <b-col
                lg="3"
                md="6"
                v-for="device in deviceList"
                :key="device.deviceId"
              >
                <button
                  type="button"
                  class="btn-icon-clipboard"
                  title=""
                  @click="onDeviceClicked(device.deviceId)"
                  data-original-title="Copy to clipboard"
                >
                  <div>
                    <i class="fa fa-microchip"></i>
                    <span>{{ device.deviceId }}</span>
                  </div>
                </button>
              </b-col>
            </b-row>
          </card>
        </b-col>
      </b-row>
      <device-info
        :deviceId="selectedDeviceId"
        :key="selectedDeviceId"
        v-if="selectedDeviceId != null"
      ></device-info>
    </b-container>
  </div>
</template>
<script>
import Vue from "vue";
import VueClipboard from "vue-clipboard2";
import BaseHeader from "@/components/BaseHeader";
import axios from "axios";
import moment from "moment";
import DeviceInfo from "./DeviceInfo";
import { SERVER_PARAMS } from '../environment/environment';
Vue.use(VueClipboard);
export default {
  name: "icons",
  components: {
    BaseHeader,
    DeviceInfo,
  },
  data() {
    return {
      deviceList: [],
      polling: null,
      selectedDeviceId: null,
      SERVER_URL: SERVER_PARAMS.URL,
    };
  },
  methods: {
    async getCurrentStates() {
      await axios
        .get(`${this.SERVER_URL}/getDeviceBySite?site=Rayong-1`)
        .then((response) => {
          console.log("DEVICES lIST ", response);
          this.deviceList = [];
          if (response.data.length > 0) {
            this.deviceList = response.data;
          }
        })
        .catch((e) => {
          console.log("ERROR |", e);
        });
    },
    onDeviceClicked(deviceId) {
      console.log("Clicked at ", deviceId);
      if (this.selectedDeviceId === deviceId) {
        this.selectedDeviceId = null;
      } else {
        this.selectedDeviceId = deviceId;
      }
    },
    onCopy() {
      this.$notify({
        type: "info",
        message: "Copied to clipboard",
      });
    },
  },
  created() {
    this.getCurrentStates();
  },
};
</script>
<style></style>
