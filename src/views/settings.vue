<template>
  <div id="pp_settings">
    <ul class="nav nav-tabs">
      <li :class="{active: tab == 'settings'}">
        <a @click="tab = 'settings'">Settings</a>
      </li>
      <li :class="{active: tab == 'about'}">
        <a @click="tab = 'about'">About Pendoria+</a>
      </li>
    </ul>

    <div class="tab-game-content">
      <div v-if="tab == 'settings'">
        <div v-for="(module, name) in modulesWithSettings">
          <h2 class="pp_settings_module_header" @click="toggleModuleSettings(name)">
            <input v-if="'enabled' in module.settings" type="checkbox" v-model="module.settings.enabled.value" @click="toggleModule(name, $event)">
            {{ name }}
          </h2>
          <div v-show="modulesOpened.includes(name) || true">
            <div v-for="(value, setting) in module.settings" v-if="setting != 'enabled'" style="min-height: 31px;">
              <label :for="setting">
                {{ value.label }}
              </label>
              <input v-if="value.type == 'checkbox'" :id="setting" type="checkbox" v-model="value.value">
              <div v-if="value.type == 'number'" style="display: inline-block; width: 40%">
                <input :id="setting" type="range" :min="value.constraint.min" :max="value.constraint.max" v-model.number="value.value" />
                {{ value.value }}
              </div>
              <select v-if="value.type == 'select'" :id="setting" v-model="value.value">
                <option v-for="option in value.options" :value="option"> <!--  :selected="option == module.settings[setting]" -->
                  {{ option | capitalize }}
                </option>
              </select>

              <button @click="playSound" v-if="setting === 'sound'">&#9658;</button>
            </div>
          </div>
        </div>

        <button @click="saveSettings">Save settings</button>

        <!-- <label>
          <input type="checkbox" name="pendoriaplus_stats_panel_enabled">
          Show stats panel under mini profile
        </label>
        <br>
        <label>
          <input type="checkbox" name="pendoriaplus_low_action_notification">
          Play sound when actions are running low:
          <select name="pendoriaplus_low_action_notification_sound">
            <option value="dingaling">Dingaling</option>
            <option value="ting">Ting</option>
            <option value="pop">Pop</option>
          </select>
        </label>
        <br>
        <label data-show="low_action_notification">
          Volume: <input v-model="settings.lowActionNotificationVolume" type="range" min="0" max="100">
          {{settings.lowActionNotificationVolume}}
          <button @click="playSound">&#9658;</button>
        </label> -->

        <!-- label>
          <input type="checkbox" name="pendoriaplus_low_actions">
          Play sound when actions are running low
        </label -->
      </div>

      <div v-if="tab == 'about'">
        <p>
          Thanks for using <strong>Pendoria+</strong>!
        </p>

        <p>
          Pendoria+ is a combination of visual improvements and enhancements to the overal Pendoria experience. Created by Xikeon.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  import {capitalize} from '../utils'
  import ModuleManager from '../ModuleManager'

  export default {
    filters: {capitalize},

    data () {
      return {
        modulesOpened: []
      }
    },

    computed: {
      modulesWithSettings () {
        return Object.keys(this.modules)
          .filter(k => 'settings' in this.modules[k] && Object.keys(this.modules[k].settings).length > 0)
          .reduce((res, k) => (res[k] = this.modules[k], res), {})
      }
    },

    methods: {
      toggleModule (name, value) {
        // Note: this couldn't be a deep watcher due to Vue internally giving a stack overflow
        if (value instanceof MouseEvent) {
          value = value.target.checked
        }

        if (value) {
          setTimeout(() => {
            this.modules[name].enable()
          }, 50)
        } else {
          this.$nextTick(() => {
            this.modules[name].disable()
          })
        }
      },

      toggleModuleSettings (name) {
        return
        const idx = this.modulesOpened.indexOf(name)
        if (idx !== -1) {
          this.modulesOpened.splice(idx, 1)
        } else {
          this.modulesOpened.push(name)
        }
      },

      saveSettings () {
        ModuleManager.saveSettings()
      }
    }
  }
</script>

<style>
  .pp_settings_module_header {
    border-bottom: 1px solid white;
  }
</style>