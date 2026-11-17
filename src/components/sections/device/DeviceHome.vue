<template>
  <div ref="home" class="deviceHome" :class="{ zooming: zoom, zoomClip: zoom || zoomStyle.transform, zoomInstant, bare }"
       @click="backgroundClick">
    <div class="deviceColumn">
      <DeviceViewChrome v-if="bare" @open-app="$emit('open-app')"/>
      <div v-else class="topBar">
        <span class="help" tabindex="0" :aria-label="$t('message.device.hint')">?
          <span class="tip" aria-hidden="true">{{ $t('message.device.hint') }}</span>
        </span>
      </div>

      <div ref="scroller" class="scroller">
        <section ref="device" class="device" :class="{ mini: isMini }" :style="zoomStyle" :aria-label="$t('message.device.title')"
                 @pointerdown="bareDrag">

          <!-- Mixer: four faders with scribble screens, LED strips and mute buttons -->
          <div class="zone mixerZone">
            <div ref="zoom-configuration" class="faders zoomable" :class="{ zoomFocus: zoom === 'configuration' }">
              <button type="button" class="zoomChip" @click="zoomInto('configuration')">
                ⤢ {{ $t('message.device.advanced') }}
              </button>
              <div v-for="fader in faders" :key="fader" class="faderColumn"
                   :class="{ selected: isSelected('fader', fader) }" @contextmenu.prevent="openMenu($event, 'fader', fader)">
                <!-- The screen opens this fader's settings; dragging the fader only changes the volume -->
                <button type="button" class="screen" :style="screenStyle(fader)" :title="$t('message.device.settings')"
                        :aria-label="$t('message.device.settings') + ': ' + channelLabel(fader)" @click="select('fader', fader)">
                  <CustomScreenView v-if="!isMini && faderStatus(fader).custom_screen" :screen="faderStatus(fader).custom_screen"/>
                  <ScribbleScreen v-else-if="!isMini" :src="scribbleUrl(fader)"/>
                  <template v-else>{{ channelLabel(fader) }}</template>
                  <span class="gear"><font-awesome-icon icon="fa-solid fa-gear"/></span>
                </button>

                <div class="faderTrack" role="slider" tabindex="0"
                     :class="{ dragging: drag && drag.type === 'fader' && drag.fader === fader }"
                     :aria-label="channelLabel(fader)" aria-valuemin="0" aria-valuemax="100"
                     :aria-valuenow="volumePercent(fader)"
                     @pointerdown="faderDown($event, fader)" @pointermove="faderMove($event, fader)"
                     @pointerup="faderUp($event, fader)" @pointercancel="faderUp($event, fader)"
                     @lostpointercapture="faderUp($event, fader)"
                     @keydown="faderKey($event, fader)">
                  <div class="leds left">
                    <span v-for="i in ledCount" :key="i" :style="{ background: ledColour(fader, i - 1) }"></span>
                  </div>
                  <div class="leds right">
                    <span v-for="i in ledCount" :key="i" :style="{ background: ledColour(fader, i - 1) }"></span>
                  </div>
                  <div class="rail"></div>
                  <div class="cap" :style="{ bottom: capBottom(fader) + 'px' }"><span></span></div>
                </div>

                <span class="percent">{{ volumePercent(fader) }}%</span>

                <button type="button" class="mute" :class="{ blink: isMutedToAll(fader) }"
                        :style="muteStyle(fader)" :aria-pressed="isMuted(fader)"
                        :aria-label="$t('message.device.muteChannel', { channel: channelLabel(fader) })"
                        @click="toggleMute(fader)">
                  <font-awesome-icon icon="fa-solid fa-volume-xmark"/>
                </button>
              </div>
            </div>
            <button type="button" class="zoneLabel zoomLabel" @click="zoomInto('configuration')">{{ $t('message.navigation.mixer') }}</button>
          </div>

          <!-- Effects and sampler (GoXLR full only) -->
          <div v-if="!isMini" class="zone middleZone">
            <div ref="zoom-effects" class="effectsArea zoomable" :class="{ zoomFocus: zoom === 'effects' }">
              <button type="button" class="zoomChip" @click="zoomInto('effects')">
                ⤢ {{ $t('message.device.advanced') }}
              </button>
              <div class="presets">
                <button v-for="n in 6" :key="n" type="button" class="preset"
                        :class="{ selected: isSelected('preset', n) }" :style="presetStyle(n)"
                        :aria-label="presetName(n)" @click="pressPreset(n)" @contextmenu.prevent="select('preset', n)">{{ n }}
                </button>
              </div>
              <div class="knobArea">
                <div class="logo">GO<LogoX :colour="accentColour()"/>LR<small>EXCE<i>I</i><i>I</i>ENT</small></div>
                <div class="knobs">
                  <button v-for="knob in knobs" :key="knob.id" type="button" class="knob"
                          :class="{ selected: isSelected('knob', knob.id), dragging: dragKnob === knob.id }"
                          :title="$t('message.device.knobHint')"
                          :aria-label="knobLabel(knob) + ', ' + knobValueText(knob)"
                          @pointerdown="knobDown($event, knob)" @pointermove="knobMove($event, knob)"
                          @pointerup="knobUp(knob)" @pointercancel="knobUp(knob)"
                          @dblclick="resetKnob(knob)" @keydown="knobKey($event, knob)"
                          @click="knobClick($event, knob)" @contextmenu.prevent="openMenu($event, 'knob', knob.id)">
                    <span class="ring">
                      <span v-for="dot in knobDots(knob)" :key="dot.i" class="dot"
                            :style="{ left: dot.x + 'px', top: dot.y + 'px', background: dot.colour, transform: 'rotate(' + dot.a + 'deg)', boxShadow: dot.glow }"></span>
                      <span class="cap" :class="{ snapped: isSnapped(knob) && dragKnob === knob.id }">
                        <span class="pointer" :style="{ transform: 'rotate(' + knobRotation(knob) + 'deg)', background: encoderColour(knob, 'colour_three') }"></span>
                      </span>
                    </span>
                    <!-- The name opens the knob's settings; dragging the knob only changes the amount -->
                    <span class="knobName" :title="$t('message.device.settings')"
                          @pointerdown.stop @dblclick.stop @click.stop="select('knob', knob.id)">
                      {{ dragKnob === knob.id ? knobValueText(knob) : knobLabel(knob) }}
                      <font-awesome-icon icon="fa-solid fa-gear" class="nameGear"/>
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <button type="button" class="zoneLabel zoomLabel" @click="zoomInto('effects')">{{ $t('message.navigation.effects') }}</button>

            <div ref="zoom-sampler" class="samplerArea zoomable" :class="{ zoomFocus: zoom === 'sampler' }">
              <button type="button" class="zoomChip" @click="zoomInto('sampler')">
                ⤢ {{ $t('message.device.advanced') }}
              </button>
              <div class="banks">
                <button v-for="bank in banks" :key="bank" type="button" class="bank" :style="bankStyle(bank)"
                        :aria-pressed="activeBank() === bank" @click="pressBank(bank)">{{ bank }}
                </button>
              </div>
              <div class="pads">
                <button v-for="pad in pads" :key="pad.id" type="button" class="pad" :class="[pad.css, { selected: isSelected('pad', pad.id) }]"
                        :style="padStyle(pad.id)" :aria-label="padLabel(pad)" :title="$t('message.device.rightClickSettings')"
                        @click="pressPad(pad)" @contextmenu.prevent="select('pad', pad.id)"></button>
                <button type="button" class="clear" :class="{ selected: isSelected('clear', 'clear') }"
                        :style="clearStyle()" @click="select('clear', 'clear')">{{ $t('message.common.clear') }}
                </button>
              </div>
            </div>
            <button type="button" class="zoneLabel zoomLabel" @click="zoomInto('sampler')">{{ $t('message.navigation.sampler') }}</button>
          </div>

          <!-- Effect buttons, bleep and cough -->
          <div class="zone rightZone">
            <div v-if="!isMini" class="fxButtons">
              <button v-for="fx in fxButtons" :key="fx.id" type="button" class="fx" :class="[fx.css, { selected: isSelected('fx', fx.id) }]"
                      :style="fxStyle(fx)" :aria-pressed="fxEnabled(fx)" :title="$t('message.device.rightClickSettings')"
                      @click="pressFx(fx)" @contextmenu.prevent="select('fx', fx.id)">{{ fxLabel(fx) }}
              </button>
            </div>
            <div class="muteButtons">
              <button type="button" class="bleep" :class="{ selected: isSelected('cough', 'bleep') }" :style="bleepStyle()"
                      :aria-label="$t('message.microphone.extras.bleep')" :title="$t('message.device.bleepHint')"
                      @contextmenu.prevent="select('cough', 'bleep')">!@#$?*
              </button>
              <button type="button" class="cough" :class="{ selected: isSelected('cough', 'cough') }" :style="coughStyle()"
                      :aria-label="$t('message.lighting.cough.buttons.cough')" :aria-pressed="coughMuted()"
                      :title="$t('message.device.rightClickSettings')"
                      @click="pressCough" @contextmenu.prevent="select('cough', 'cough')">
                <span><font-awesome-icon icon="fa-solid fa-microphone-slash"/></span>
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- Every channel and output that isn't on a hardware fader, still one click away -->
      <section v-if="!bare" class="others" :aria-label="$t('message.device.notOnFader')">
        <div class="othersHead">
          <h2>{{ $t('message.device.notOnFader') }}</h2>
          <span>{{ $t('message.device.notOnFaderHint') }}</span>
        </div>
        <div class="othersGrid">
          <div v-for="channel in unassignedChannels()" :key="channel" class="otherChip"
               :class="{ selected: isSelected('channel', channel), output: isOutputChannel(channel) }">
            <button type="button" class="otherName" :title="$t('message.device.settings')"
                    @click="select('channel', channel)">
              <span>{{ $t(`message.channels.${channel}`) }}</span>
              <small>{{ channelPercent(channel) }}%</small>
            </button>
            <input type="range" class="otherBar" min="0" max="255" :value="channelVolume(channel)"
                   :style="{ '--fill': channelPercent(channel) + '%' }"
                   :aria-label="$t(`message.channels.${channel}`)"
                   @input="setChannelVolume(channel, +$event.target.value)">
          </div>
        </div>
      </section>
    </div>

    <!-- Settings for whatever is selected on the device: slides in when asked for, the device grows back when it closes -->
    <div v-if="!bare" class="panelSlot" :class="{ open: panelOpen }" :inert="!panelOpen">
    <aside class="panel" :aria-label="panelTitle()">
      <div class="panelHead">
        <span class="swatch" :style="{ background: panelColour() }"></span>
        <div>
          <div class="kind">{{ panelKind() }}</div>
          <h2>{{ panelTitle() }}</h2>
        </div>
        <button type="button" class="closePanel" :aria-label="$t('message.device.closeSettings')"
                :title="$t('message.device.closeSettings') + '  Esc'" @click="closePanel">
          <font-awesome-icon icon="fa-solid fa-xmark"/>
        </button>
      </div>

      <template v-if="selection.kind === 'fader'">
        <div class="field">
          <div class="row"><label for="dh-volume">{{ $t('message.device.volume') }}</label><span class="value">{{ volumePercent(selection.id) }}%</span></div>
          <input id="dh-volume" type="range" min="0" max="255" :value="volume(selection.id)"
                 @input="setVolume(selection.id, +$event.target.value)" @change="endVolume(selection.id)">
        </div>
        <div class="field">
          <label for="dh-channel">{{ $t('message.device.channel') }}</label>
          <select id="dh-channel" :value="faderStatus(selection.id).channel" @change="setFaderChannel(selection.id, $event.target.value)">
            <option v-for="c in channelOptions" :key="c" :value="c">{{ $t(`message.channels.${c}`) }}</option>
          </select>
        </div>
        <div class="field">
          <label for="dh-mute">{{ $t('message.device.muteButton') }}</label>
          <select id="dh-mute" :value="faderStatus(selection.id).mute_type" @change="setFaderMuteFunction(selection.id, $event.target.value)">
            <option v-for="m in muteFunctionOptions(faderStatus(selection.id).mute_type)" :key="m.id" :value="m.id">{{ m.label }}</option>
          </select>
        </div>
      </template>

      <template v-if="selection.kind === 'channel'">
        <div class="field">
          <div class="row"><label for="dh-cvolume">{{ $t('message.device.volume') }}</label><span class="value">{{ channelPercent(selection.id) }}%</span></div>
          <input id="dh-cvolume" type="range" min="0" max="255" :value="channelVolume(selection.id)"
                 @input="setChannelVolume(selection.id, +$event.target.value)">
        </div>
        <div class="field">
          <span class="label">{{ $t('message.device.putOnFader') }}</span>
          <div class="segmented four" role="group" :aria-label="$t('message.device.putOnFader')">
            <button v-for="(fader, i) in faders" :key="fader" type="button" @click="assignToFader(selection.id, fader)">
              {{ i + 1 }}<small>{{ channelLabel(fader) }}</small>
            </button>
          </div>
        </div>
      </template>

      <!-- Where this channel's sound goes (inputs) or what you hear on it (outputs) -->
      <fieldset v-if="routing().rows.length" class="routes">
        <legend>{{ routing().mode === 'send' ? $t('message.device.sendTo') : $t('message.device.hearHere') }}</legend>
        <label v-for="route in routing().rows" :key="route.id" class="routeRow" :class="{ disabled: route.disabled }">
          <input type="checkbox" :checked="route.on" :disabled="route.disabled" @change="route.toggle()">
          <span>{{ route.label }}</span>
        </label>
      </fieldset>

      <template v-if="selection.kind === 'knob'">
        <div class="field">
          <label for="dh-kstyle">{{ $t('message.device.style') }}</label>
          <select id="dh-kstyle" :value="effect(selectedKnob().effect).style" @change="setEffectStyle(selectedKnob(), $event.target.value)">
            <option v-for="s in selectedKnob().styles" :key="s" :value="s">{{ styleLabel(selectedKnob(), s) }}</option>
          </select>
        </div>
        <div class="field">
          <div class="row"><label for="dh-kamount">{{ $t('message.device.amount') }}</label><span class="value">{{ knobValueText(selectedKnob()) }}</span></div>
          <input id="dh-kamount" type="range" min="0" max="1000" :value="Math.round(knobPos(selectedKnob()) * 1000)"
                 @input="panelKnobInput(selectedKnob(), +$event.target.value / 1000)" @change="endKnob(selectedKnob())">
        </div>
        <button type="button" class="action" @click="resetKnob(selectedKnob())">{{ $t('message.device.reset') }}</button>
        <p class="more">{{ $t('message.device.knobHint') }}</p>
      </template>

      <template v-if="selection.kind === 'fx'">
        <label class="toggleRow">
          <span>{{ $t('message.device.effectOn') }}</span>
          <input type="checkbox" :checked="fxEnabled(selectedFx())" @change="pressFx(selectedFx())">
        </label>
        <div v-if="selectedFx().styles" class="field">
          <label for="dh-fstyle">{{ $t('message.device.style') }}</label>
          <select id="dh-fstyle" :value="effect(selectedFx().effect).style" @change="setEffectStyle(selectedFx(), $event.target.value)">
            <option v-for="s in selectedFx().styles" :key="s" :value="s">{{ styleLabel(selectedFx(), s) }}</option>
          </select>
        </div>
        <div v-if="selectedFx().amountCommand" class="field">
          <div class="row"><label for="dh-famount">{{ $t('message.device.amount') }}</label><span class="value">{{ effect(selectedFx().effect).amount }}%</span></div>
          <input id="dh-famount" type="range" min="0" max="100" :value="effect(selectedFx().effect).amount"
                 @input="setFxAmount(selectedFx(), +$event.target.value)">
        </div>
      </template>

      <template v-if="selection.kind === 'preset'">
        <p class="more">{{ $t('message.device.presetHelp') }}</p>
        <p class="more">{{ $t('message.device.moreIn', { tab: $t('message.navigation.presets') }) }}</p>
      </template>

      <template v-if="selection.kind === 'pad'">
        <div class="field sampleDrop" :class="{ dragover: sampleDragDepth > 0 && !sampleImport.busy }"
             :aria-busy="sampleImport.busy"
             @dragenter.prevent="sampleDragDepth++" @dragover.prevent
             @dragleave.prevent="sampleDragDepth = Math.max(0, sampleDragDepth - 1)"
             @drop.prevent.stop="dropSamples($event)">
          <span class="label">{{ $t('message.device.samplesOnPad') }}</span>
          <ul class="samples">
            <li v-for="(sample, index) in padSamples(selection.id)" :key="sample.name + '-' + index">
              <span class="sampleName" :title="sample.name">{{ sample.name }}</span>
              <button type="button" class="removeSample" :disabled="sampleImport.busy || sampleDeleteBusy"
                      :aria-label="$t('message.device.removeSample', { name: sample.name })"
                      :title="$t('message.device.removeSample', { name: sample.name })"
                      @click="removePadSample(index)">×</button>
            </li>
            <li v-if="padSamples(selection.id).length === 0" class="empty">{{ $t('message.device.noSample') }}</li>
          </ul>
          <p class="sampleDropHint">{{ $t('message.device.dropSamples') }}</p>
          <p class="sampleFormats">WAV · MP3 · OGG · FLAC · {{ $t('message.device.sampleSizeLimit') }}</p>
          <input ref="sampleFiles" type="file" hidden multiple accept=".wav,.mp3,.ogg,.flac" @change="chooseSamples($event)">
          <button type="button" class="addSamples" :disabled="sampleImport.busy || sampleDeleteBusy"
                  @click="$refs.sampleFiles.click()">{{ $t('message.device.addSamples') }}</button>
          <p v-if="sampleImport.busy" class="sampleProgress" role="status">
            {{ $t('message.device.importingSamples', { current: sampleImport.done + 1, total: sampleImport.total }) }}
            <span>{{ sampleImport.current }}</span>
          </p>
          <p v-else-if="sampleImport.done > 0" class="sampleProgress" role="status">
            {{ $t('message.device.samplesImported', { count: sampleImport.added }) }}
          </p>
          <ul v-if="sampleImport.errors.length" class="sampleErrors" role="alert">
            <li v-for="(error, index) in sampleImport.errors" :key="index">{{ error }}</li>
          </ul>
          <p v-if="sampleError" class="sampleError" role="alert">{{ sampleError }}</p>
        </div>
        <p class="more">{{ $t('message.device.moreIn', { tab: $t('message.navigation.sampler') }) }}</p>
      </template>

      <template v-if="selection.kind === 'clear'">
        <p class="more">{{ $t('message.device.clearHelp') }}</p>
      </template>

      <template v-if="selection.kind === 'cough'">
        <div class="field">
          <span class="label">{{ $t('message.configuration.cough.behaviourTitle') }}</span>
          <div class="segmented" role="group">
            <button type="button" :aria-pressed="coughIsHold()" @click="setCoughHold(true)">{{ $t('message.configuration.cough.behaviour.hold') }}</button>
            <button type="button" :aria-pressed="!coughIsHold()" @click="setCoughHold(false)">{{ $t('message.configuration.cough.behaviour.toggle') }}</button>
          </div>
        </div>
        <div class="field">
          <label for="dh-cmute">{{ $t('message.device.muteButton') }}</label>
          <select id="dh-cmute" :value="cough().mute_type" @change="setCoughMuteFunction($event.target.value)">
            <option v-for="m in muteFunctionOptions(cough().mute_type)" :key="m.id" :value="m.id">{{ m.label }}</option>
          </select>
        </div>
        <button type="button" class="action" @click="toggleCoughMute()">
          {{ cough().state === 'Unmuted' ? $t('message.device.muteMic') : $t('message.device.unmuteMic') }}
        </button>
        <div class="field">
          <div class="row"><label for="dh-bleep">{{ $t('message.device.bleepVolume') }}</label><span class="value">{{ bleepPercent() }}%</span></div>
          <input id="dh-bleep" type="range" min="-36" max="0" :value="device().levels.bleep" @input="setBleep(+$event.target.value)">
        </div>
      </template>

      <!-- Advanced: everything else for this control, folded away until asked for -->
      <div v-if="hasAdvanced()" class="advanced">
        <button type="button" class="advancedToggle" :aria-expanded="advancedOpen" @click="advancedOpen = !advancedOpen">
          <span>{{ $t('message.device.advanced') }}</span>
          <font-awesome-icon icon="fa-solid fa-chevron-down" class="chevron" :class="{ flipped: advancedOpen }"/>
        </button>

        <div v-if="advancedOpen" class="advancedBody">
          <template v-if="selection.kind === 'fader'">
            <div class="field">
              <label for="dh-lstyle">{{ $t('message.device.lightStyle') }}</label>
              <select id="dh-lstyle" :value="device().lighting.faders[selection.id].style" @change="setFaderStyle(selection.id, $event.target.value)">
                <option v-for="s in faderStyles" :key="s" :value="s">{{ $t(`message.device.faderStyles.${s}`) }}</option>
              </select>
            </div>
            <div class="colours">
              <ColourSwatch id="dh-colour-1" variant="chip" :value="device().lighting.faders[selection.id].colours.colour_one" :label="$t('message.lighting.mixer.fader.topColour')" @change="setFaderColour(selection.id, 'colour_one', '#' + $event)"/>
              <ColourSwatch id="dh-colour-2" variant="chip" :value="device().lighting.faders[selection.id].colours.colour_two" :label="$t('message.lighting.mixer.fader.bottomColour')" @change="setFaderColour(selection.id, 'colour_two', '#' + $event)"/>
              <ColourSwatch v-if="!isMini" id="dh-colour-3" variant="chip" :value="device().lighting.simple[scribbleNames[selection.id]].colour_one" :label="$t('message.lighting.mixer.screen.backgroundColour')" @change="setScreenColour(selection.id, '#' + $event)"/>
            </div>
            <span class="label">{{ $t('message.lighting.mixer.mute.title') }}</span>
            <div class="colours">
              <ColourSwatch id="dh-colour-4" variant="chip" :value="buttonLighting(muteButtons[selection.id]).colours.colour_one" :label="$t('message.lighting.common.activeColour')" @change="setButtonColour(muteButtons[selection.id], 'colour_one', '#' + $event)"/>
              <ColourSwatch id="dh-colour-5" variant="chip" :value="buttonLighting(muteButtons[selection.id]).colours.colour_two" :label="$t('message.lighting.common.inactiveColour')" @change="setButtonColour(muteButtons[selection.id], 'colour_two', '#' + $event)"/>
            </div>
          </template>

          <template v-if="selection.kind === 'channel' && submixVolume(selection.id) !== null">
            <div class="field">
              <div class="row"><label for="dh-mixb">{{ $t('message.device.mixB') }}</label><span class="value">{{ Math.round(submixVolume(selection.id) / 255 * 100) }}%</span></div>
              <input id="dh-mixb" type="range" min="0" max="255" :value="submixVolume(selection.id)" @input="setSubmixVolume(selection.id, +$event.target.value)">
            </div>
          </template>

          <template v-if="selection.kind === 'knob' || selection.kind === 'fx'">
            <div v-for="row in fineRows()" :key="row.key" class="fine">
              <label :for="'dh-fine-' + row.key">{{ row.label }}</label>
              <input :id="'dh-fine-' + row.key" type="range" :min="row.min" :max="row.max" :value="row.value" @input="setFine(row, +$event.target.value)">
              <span class="value">{{ row.value }}</span>
            </div>
          </template>

          <div v-if="selection.kind === 'knob'" class="colours">
            <ColourSwatch id="dh-colour-6" variant="chip" :value="(encoderColour(selectedKnob(), 'colour_two')).substring(1)" :label="$t('message.lighting.effects.encoders.leftColour')" @change="setEncoderColour(selectedKnob(), 'colour_two', '#' + $event)"/>
            <ColourSwatch id="dh-colour-7" variant="chip" :value="(encoderColour(selectedKnob(), 'colour_one')).substring(1)" :label="$t('message.lighting.effects.encoders.rightColour')" @change="setEncoderColour(selectedKnob(), 'colour_one', '#' + $event)"/>
            <ColourSwatch id="dh-colour-8" variant="chip" :value="(encoderColour(selectedKnob(), 'colour_three')).substring(1)" :label="$t('message.lighting.effects.encoders.knobColour')" @change="setEncoderColour(selectedKnob(), 'colour_three', '#' + $event)"/>
          </div>

          <div v-if="advancedButton()" class="colours">
            <ColourSwatch id="dh-colour-9" variant="chip" :value="buttonLighting(advancedButton()).colours.colour_one" :label="$t('message.lighting.common.activeColour')" @change="setButtonColour(advancedButton(), 'colour_one', '#' + $event)"/>
            <ColourSwatch id="dh-colour-10" variant="chip" :value="buttonLighting(advancedButton()).colours.colour_two" :label="$t('message.lighting.common.inactiveColour')" @change="setButtonColour(advancedButton(), 'colour_two', '#' + $event)"/>
          </div>
        </div>
      </div>
    </aside>
    </div>

    <!-- Right-click menu for a fader or knob -->
    <div v-if="menu" ref="menu" class="ctxMenu" role="menu" :style="{ left: menu.x + 'px', top: menu.y + 'px' }">
      <div class="ctxTitle">{{ menu.title }}</div>
      <template v-for="(item, i) in menu.items" :key="i">
        <hr v-if="item.separator">
        <button v-else type="button" role="menuitem" @click="runMenu(item)">
          <span>{{ item.label }}</span><small v-if="item.hint">{{ item.hint }}</small>
        </button>
      </template>
    </div>
  </div>
</template>

<script>
import {store} from "@/store";
import {navDrawer} from "@/util/navDrawer";
import ScribbleScreen from "@/components/design/ScribbleScreen.vue";
import ColourSwatch from "@/components/sections/lighting/elements/ColourSwatch.vue";
import {liveMeters, useLiveMeters} from "@/util/liveMeters";
import {ledColour} from "@/util/faderLeds";
import {websocket, getBaseHTTPAddress} from "@/util/sockets";
import {assignFaderChannel} from "@/util/faderChannel";
import {firmwareSupportsMix2, isDeviceMini} from "@/util/util";
import {dragWindow, inApp} from "@/util/appWindow";
import DeviceViewChrome from "@/components/sections/device/DeviceViewChrome.vue";
import LogoX from "@/components/sections/device/LogoX.vue";
import CustomScreenView from "@/components/design/CustomScreenView.vue";
import {
  channelNameToInputDevice,
  InputRouting,
  MuteButtonNamesForFader,
  OutputRouting,
  ScribbleNames
} from "@/util/mixerMapping";

// Pitch / Gender detent: within this much of the centre (as a fraction of the knob's travel)
// the knob sticks to zero, so you have to pull a little further to leave it.
const DETENT = 0.09;
// Pixels of horizontal drag for a knob's full travel
const KNOB_DRAG_PX = 200;
const LED_COUNT = 15;
const KNOB_DOTS = 13;
const FADER_TRAVEL_PADDING = 58; // height of the fader cap

const KNOBS = [
  {id: "reverb", effect: "reverb", encoder: "Reverb", i18n: "reverb", centred: false,
    amountCommand: "SetReverbAmount", styleCommand: "SetReverbStyle",
    styles: ["Library", "DarkBloom", "MusicClub", "RealPlate", "Chapel", "HockeyArena"]},
  {id: "pitch", effect: "pitch", encoder: "Pitch", i18n: "pitch", centred: true,
    amountCommand: "SetPitchAmount", styleCommand: "SetPitchStyle", styles: ["Narrow", "Wide"]},
  {id: "echo", effect: "echo", encoder: "Echo", i18n: "echo", centred: false,
    amountCommand: "SetEchoAmount", styleCommand: "SetEchoStyle",
    styles: ["Quarter", "Eighth", "Triplet", "PingPong", "ClassicSlap", "MultiTap"]},
  {id: "gender", effect: "gender", encoder: "Gender", i18n: "gender", centred: true,
    amountCommand: "SetGenderAmount", styleCommand: "SetGenderStyle", styles: ["Narrow", "Medium", "Wide"]},
];

const FX_BUTTONS = [
  {id: "megaphone", button: "EffectMegaphone", effect: "megaphone", i18n: "megaphone", css: "small",
    toggleCommand: "SetMegaphoneEnabled", styleCommand: "SetMegaphoneStyle", amountCommand: "SetMegaphoneAmount",
    styles: ["Megaphone", "Radio", "OnThePhone", "Overdrive", "BuzzCutt", "Tweed"]},
  {id: "robot", button: "EffectRobot", effect: "robot", i18n: "robot", css: "small",
    toggleCommand: "SetRobotEnabled", styleCommand: "SetRobotStyle", styles: ["Robot1", "Robot2", "Robot3"]},
  {id: "hardTune", button: "EffectHardTune", effect: "hard_tune", i18n: "hardTune", css: "small",
    toggleCommand: "SetHardTuneEnabled", styleCommand: "SetHardTuneStyle", amountCommand: "SetHardTuneAmount",
    styles: ["Natural", "Medium", "Hard"]},
  {id: "fx", button: "EffectFx", effect: null, i18n: null, css: "large", toggleCommand: "SetFXEnabled"},
];

// Device view: what a click on each kind of part opens ([part to zoom on, page])
const BARE_PAGES = {
  fader: ["configuration", "mixer"], channel: ["configuration", "mixer"],
  knob: ["effects", "effects"], preset: ["effects", "effects"], fx: ["effects", "effects"],
  pad: ["sampler", "sampler"], clear: ["sampler", "sampler"],
  cough: [null, "configuration"],
};

const PADS = [
  {id: "TopLeft", css: "tl"}, {id: "TopRight", css: "tr"},
  {id: "BottomLeft", css: "bl"}, {id: "BottomRight", css: "br"},
];

const CHANNELS = ["Mic", "Chat", "Music", "Game", "Console", "LineIn", "System", "Sample", "Headphones", "MicMonitor", "LineOut"];
const OUTPUT_CHANNELS = ["Headphones", "LineOut", "MicMonitor"];
const FADER_STYLES = ["TwoColour", "Gradient", "Meter", "GradientMeter"];

// Fine controls shown under Advanced, per effect: [store key, min, max, command, i18n key]
// (ranges match the full Effects tab)
const FINE = {
  reverb: [
    ["early_level", -25, 0, "SetReverbEarlyLevel", "earlyLevel"],
    ["tail_level", -25, 0, "SetReverbTailLevel", "tailLevel"],
    ["pre_delay", 0, 100, "SetReverbPreDelay", "preDelay"],
    ["lo_colour", -50, 50, "SetReverbLowColour", "lowColour"],
    ["hi_colour", -50, 50, "SetReverbHighColour", "highColour"],
    ["hi_factor", -25, 25, "SetReverbHighFactor", "highFactor"],
    ["diffuse", -50, 50, "SetReverbDiffuse", "diffuse"],
    ["mod_speed", -25, 25, "SetReverbModSpeed", "modSpeed"],
    ["mod_depth", -25, 25, "SetReverbModDepth", "modDepth"],
  ],
  echo: [
    ["feedback", 0, 100, "SetEchoFeedback", "feedback"],
    ["tempo", 45, 300, "SetEchoTempo", "tempo"],
    ["delay_left", 0, 2500, "SetEchoDelayLeft", "delayLeft"],
    ["delay_right", 0, 2500, "SetEchoDelayRight", "delayRight"],
    ["feedback_left", 0, 100, "SetEchoFeedbackLeft", "feedbackLeft"],
    ["feedback_right", 0, 100, "SetEchoFeedbackRight", "feedbackRight"],
    ["feedback_xfb_l_to_r", 0, 100, "SetEchoFeedbackXFBLtoR", "xfbLeftToRight"],
    ["feedback_xfb_r_to_l", 0, 100, "SetEchoFeedbackXFBRtoL", "xfbRightToLeft"],
  ],
  pitch: [
    ["character", 0, 100, "SetPitchCharacter", "character"],
  ],
  megaphone: [
    ["post_gain", -20, 20, "SetMegaphonePostGain", "postGain"],
  ],
  robot: [
    ["waveform", 0, 2, "SetRobotWaveform", "waveform"],
    ["pulse_width", 0, 100, "SetRobotPulseWidth", "pulseWidth"],
    ["threshold", -36, 0, "SetRobotThreshold", "threshold"],
    ["dry_mix", -36, 0, "SetRobotDryMix", "dryMix"],
  ],
  hard_tune: [
    ["rate", 0, 100, "SetHardTuneRate", "rate"],
    ["window", 0, 600, "SetHardTuneWindow", "window"],
  ],
};

// Zoom from the device into a section's own page (like zooming a map), and back out again
const ZOOM_MS = 700;
const ZOOM_FILL = 0.9;
const ZOOM_EASE = "cubic-bezier(.65, 0, .25, 1)";
// The device grows to fill the page (up to FIT_MAX) and shrinks for small windows (down to FIT_MIN)
const FIT_MAX = 1.6;
const FIT_MIN = 0.5;
const FIT_MARGIN = 0.96;
const ZOOM_FADE_MS = 180;   // the device fades over the last (or first) part of the zoom
// Moving: zoom plus a fade that overlaps its end (in) or start (out). will-change keeps it on the GPU.
const zoomMove = (transform, opacity, fadeDelay) => ({
  transformOrigin: "0 0", willChange: "transform, opacity", transform, opacity,
  transition: `transform ${ZOOM_MS}ms ${ZOOM_EASE}, opacity ${ZOOM_FADE_MS}ms ease ${fadeDelay}ms`,
});

export default {
  name: "DeviceHome",
  components: {ColourSwatch, ScribbleScreen, CustomScreenView, DeviceViewChrome, LogoX},
  props: {
    zoomFrom: {type: String, default: null},   // section to zoom back out of when the page opens
    bare: {type: Boolean, default: false},     // device view: only the device, floating on the desktop
  },
  emits: ["open-section", "open-app", "device-view"],

  data() {
    return {
      faders: ["A", "B", "C", "D"],
      banks: ["A", "B", "C"],
      knobs: KNOBS,
      fxButtons: FX_BUTTONS,
      pads: PADS,
      channelOptions: CHANNELS,
      ledCount: LED_COUNT,
      faderStyles: FADER_STYLES,
      scribbleNames: ScribbleNames,
      muteButtons: MuteButtonNamesForFader,

      selection: {kind: "fader", id: "A"},
      panelOpen: false,   // the settings panel stays hidden until a screen, name, pad or button asks for it
      menu: null,         // right-click menu: {x, y, title, items}
      meters: liveMeters, // channel -> {level, peak} live audio levels (shared)
      advancedOpen: false,
      dragKnob: null,
      drag: null,
      sampleDragDepth: 0,
      sampleDeleteBusy: false,
      sampleError: "",
      sampleImport: { busy: false, done: 0, total: 0, added: 0, current: "", errors: [] },

      // Per-command send throttling: one request in flight, the latest value queued behind it
      inFlight: {},
      queued: {},
      zoom: null,
      zoomInstant: false,
      fit: 1,             // CSS zoom that makes the device fit the column (1 = full size)
      zoomStyle: {},
    }
  },

  mounted() {
    // Shrink the device to fit narrow windows instead of making you scroll or resize
    this.fitDevice();
    this.fitObserver = new ResizeObserver(() => this.fitDevice());
    this.fitObserver.observe(this.$refs.scroller);
    if (this.zoomFrom) this.zoomOut(this.zoomFrom);
    window.addEventListener("keydown", this.onKey);
    this.releaseMeters = useLiveMeters();
    window.addEventListener("pointerdown", this.menuOutside, true);
    window.addEventListener("blur", this.closeMenu);
    window.addEventListener("resize", this.closeMenu);
  },

  beforeUnmount() {
    clearTimeout(this.zoomTimer);
    this.fitObserver?.disconnect();
    window.removeEventListener("keydown", this.onKey);
    window.removeEventListener("pointerdown", this.menuOutside, true);
    window.removeEventListener("blur", this.closeMenu);
    window.removeEventListener("resize", this.closeMenu);
    this.releaseMeters?.();
  },

  computed: {
    isMini() {
      return isDeviceMini();
    },
  },

  methods: {
    // The transform that puts a section in the middle of the visible part of the page, filling it
    zoomTransform(section) {
      const target = this.$refs[`zoom-${section}`];
      const device = this.$refs.device;
      if (!target || !device) return null;
      const t = target.getBoundingClientRect();
      const d = device.getBoundingClientRect();
      const h = this.$refs.home.getBoundingClientRect();
      const top = Math.max(h.top, 0), bottom = Math.min(h.bottom, window.innerHeight);
      const scale = Math.min(h.width * ZOOM_FILL / t.width, (bottom - top) * ZOOM_FILL / t.height);
      const x = h.left + h.width / 2 - (d.left + (t.left + t.width / 2 - d.left) * scale);
      const y = (top + bottom) / 2 - (d.top + (t.top + t.height / 2 - d.top) * scale);
      // The device's own CSS zoom scales the translate too, so undo it
      return `translate(${x / this.fit}px, ${y / this.fit}px) scale(${scale})`;
    },
    fitDevice() {
      const device = this.$refs.device, scroller = this.$refs.scroller;
      if (!device || !scroller || this.zoom) return;
      const width = scroller.clientWidth, height = scroller.clientHeight;
      if (width === this.fitWidth && height === this.fitHeight) return;
      this.fitWidth = width;
      this.fitHeight = height;
      device.style.zoom = "";
      const natural = device.getBoundingClientRect();
      if (!width || !height || !natural.width || !natural.height) {
        this.fit = 1;
        return;
      }
      const fit = Math.min(width / natural.width, height / natural.height) * FIT_MARGIN;
      this.fit = Math.max(FIT_MIN, Math.min(FIT_MAX, fit));
      device.style.zoom = String(this.fit);
    },
    zoomInto(section, page = null) {
      if (this.zoom) return;
      if (!page) page = this.bare && section === "configuration" ? "mixer" : section;
      const transform = this.zoomTransform(section);
      if (!transform) {
        this.$emit("open-section", page);
        return;
      }
      this.zoom = section;
      this.zoomStyle = zoomMove(transform, 0, ZOOM_MS - ZOOM_FADE_MS);
      // Switch page only once the zoom has finished, so mounting it can't stutter the animation
      this.zoomTimer = setTimeout(() => this.$emit("open-section", page), ZOOM_MS);
    },
    zoomOut(section) {
      this.$nextTick(async () => {
        const transform = this.zoomTransform(section);
        if (!transform) return;
        // Jump straight to the zoomed-in frame (no transitions), then glide back out
        this.zoom = section;
        this.zoomInstant = true;
        this.zoomStyle = {transformOrigin: "0 0", willChange: "transform, opacity", transition: "none", transform, opacity: 0};
        await this.$nextTick();
        void this.$refs.home.offsetWidth;
        this.zoomInstant = false;
        this.zoom = null;
        this.zoomStyle = zoomMove("none", 1, 0);
        this.zoomTimer = setTimeout(() => this.zoomStyle = {}, ZOOM_MS);
      });
    },

    device() {
      return store.getActiveDevice();
    },
    serial() {
      return store.getActiveSerial();
    },
    hex(colour) {
      return "#" + colour;
    },
    rgba(colour, alpha) {
      const r = parseInt(colour.substring(0, 2), 16), g = parseInt(colour.substring(2, 4), 16), b = parseInt(colour.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
    mixHex(a, b, t) {
      const pa = [0, 2, 4].map(i => parseInt(a.substring(i, i + 2), 16));
      const pb = [0, 2, 4].map(i => parseInt(b.substring(i, i + 2), 16));
      return "rgb(" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(", ") + ")";
    },
    offStyleColour(lighting, active) {
      const one = lighting.colours.colour_one, two = lighting.colours.colour_two;
      if (active) return this.hex(one);
      switch (lighting.off_style) {
        case "Dimmed":
          return this.rgba(one, 0.4);
        case "Colour2":
          return this.hex(two);
        case "DimmedColour2":
          return this.rgba(two, 0.4);
        default:
          return this.hex(one);
      }
    },

    // Throttled send: never more than one request per key in flight, and the last value always lands
    send(key, command) {
      if (this.inFlight[key]) {
        this.queued[key] = command;
        return;
      }
      this.inFlight[key] = true;
      websocket.send_command(this.serial(), command).finally(() => {
        this.inFlight[key] = false;
        const next = this.queued[key];
        if (next) {
          this.queued[key] = null;
          this.send(key, next);
        }
      });
    },

    select(kind, id) {
      if (this.bare) {
        const [zoom, page] = BARE_PAGES[kind] || [null, "configuration"];
        if (zoom) this.zoomInto(zoom, page);
        else this.$emit("open-section", page);
        return;
      }
      this.selection = {kind: kind, id: id};
      this.panelOpen = true;
    },
    isSelected(kind, id) {
      return this.panelOpen && this.selection.kind === kind && this.selection.id === id;
    },
    closePanel() {
      this.panelOpen = false;
    },
    // Clicking empty space around the device (not the device itself or a control) goes back to just the device
    backgroundClick(event) {
      if (!this.panelOpen || this.zoom) return;
      if (event.target.closest(".device, .panelSlot, .ctxMenu, .otherChip, .help, button, input, select, label, a")) return;
      this.closePanel();
    },
    onKey(event) {
      if (event.key !== "Escape") return;
      if (this.menu) {
        this.closeMenu();
        return;
      }
      if (event.drawerClosed || navDrawer.open) return;
      if (this.panelOpen) this.closePanel();
      else if (!this.bare && inApp() && !event.target.closest?.("input, select, textarea, [role=dialog]")) this.$emit("device-view");
    },

    // The logo light (Lighting → Global → Accent)
    accentColour() {
      return "#" + this.device().lighting.simple.Accent.colour_one;
    },
    coughMuted() {
      return this.device().cough_button.state !== "Unmuted";
    },
    pressCough() {
      const button = this.device().cough_button;
      const next = button.state !== "Unmuted" ? "Unmuted" : (button.mute_type === "All" ? "MutedToAll" : "MutedToX");
      button.state = next;
      websocket.send_command(this.serial(), {"SetCoughMuteState": next});
    },

    /* ---------- Device view (the device floating on its own, see util/appWindow.js) ---------- */
    // Drag the window by any empty part of the device body
    bareDrag(event) {
      if (!this.bare || event.button !== 0) return;
      if (event.target.closest("button, input, select, a, [role=slider], .knob, .faderTrack")) return;
      dragWindow();
    },

    /* ---------- Right-click menu ---------- */
    openMenu(event, kind, id) {
      // In device view every part opens its page instead
      if (this.bare) return this.select(kind, id);
      const t = (key) => this.$t(`message.device.menu.${key}`);
      let title, items;
      if (kind === "fader") {
        title = `${this.$t('message.device.kinds.fader', {n: this.faders.indexOf(id) + 1})} · ${this.channelLabel(id)}`;
        items = [
          {label: this.$t('message.device.settings'), hint: t('clickScreen'), run: () => this.select("fader", id)},
          {label: t('changeChannel'), hint: this.channelLabel(id), run: () => this.selectAndFocus("fader", id, "dh-channel")},
          {label: t('muteButton'), run: () => this.selectAndFocus("fader", id, "dh-mute")},
          {separator: true},
          {label: this.isMuted(id) ? t('unmute') : t('mute'), run: () => this.toggleMute(id)},
          {label: t('fullVolume'), run: () => this.setVolume(id, 255)},
        ];
      } else {
        const knob = KNOBS.find(k => k.id === id);
        title = this.knobLabel(knob);
        items = [
          {label: this.$t('message.device.settings'), hint: t('clickName'), run: () => this.select("knob", id)},
          {label: t('changeStyle'), run: () => this.selectAndFocus("knob", id, "dh-kstyle")},
          {separator: true},
          {label: knob.centred ? t('resetCentre') : t('resetZero'), hint: t('doubleClick'), run: () => this.resetKnob(knob)},
        ];
      }
      this.menu = {x: event.clientX, y: event.clientY, title, items};
      // Keep the menu inside the window
      this.$nextTick(() => {
        const el = this.$refs.menu;
        if (!el || !this.menu) return;
        const r = el.getBoundingClientRect();
        this.menu.x = Math.max(4, Math.min(this.menu.x, window.innerWidth - r.width - 8));
        this.menu.y = Math.max(4, Math.min(this.menu.y, window.innerHeight - r.height - 8));
      });
    },
    runMenu(item) {
      this.closeMenu();
      item.run();
    },
    closeMenu() {
      this.menu = null;
    },
    menuOutside(event) {
      if (this.menu && !event.target.closest(".ctxMenu")) this.closeMenu();
    },
    selectAndFocus(kind, id, field) {
      this.select(kind, id);
      this.$nextTick(() => document.getElementById(field)?.focus());
    },

    /* ---------- Faders ---------- */
    faderStatus(fader) {
      return this.device().fader_status[fader];
    },
    channelLabel(fader) {
      return this.$t(`message.channels.${this.faderStatus(fader).channel}`);
    },
    volume(fader) {
      return this.device().levels.volumes[this.faderStatus(fader).channel];
    },
    volumePercent(fader) {
      return Math.round(this.volume(fader) / 255 * 100);
    },
    volumePath(fader) {
      return `/mixers/${this.serial()}/levels/volumes/${this.faderStatus(fader).channel}`;
    },
    setVolume(fader, value) {
      this.setChannelVolume(this.faderStatus(fader).channel, value);
    },
    channelVolume(channel) {
      return this.device().levels.volumes[channel];
    },
    channelPercent(channel) {
      return Math.round(this.channelVolume(channel) / 255 * 100);
    },
    setChannelVolume(channel, value) {
      value = Math.max(0, Math.min(255, Math.round(value)));
      if (this.device().levels.volumes[channel] === value) return;
      this.device().levels.volumes[channel] = value;
      this.send("volume-" + channel, {"SetVolume": [channel, value]});
    },

    /* ---------- Channels not on a fader ---------- */
    unassignedChannels() {
      const assigned = this.faders.map(f => this.faderStatus(f).channel);
      const volumes = this.device().levels.volumes;
      return CHANNELS.filter(c => !assigned.includes(c) && volumes[c] !== undefined);
    },
    isOutputChannel(channel) {
      return OUTPUT_CHANNELS.includes(channel);
    },
    assignToFader(channel, fader) {
      assignFaderChannel(this.serial(), fader, channel);
      this.select("fader", fader);
    },

    /* ---------- Routing ---------- */
    selectedChannelName() {
      if (this.selection.kind === "fader") return this.faderStatus(this.selection.id).channel;
      if (this.selection.kind === "channel") return this.selection.id;
      return null;
    },
    // Inputs list the outputs they're sent to; Headphones / Line Out list the inputs you hear on them
    routing() {
      const channel = this.selectedChannelName();
      if (!channel) return {mode: null, rows: []};
      const router = this.device().router;
      const canRoute = (input, output) => !(input === "Chat" && output === "ChatMic");
      const input = channelNameToInputDevice(channel);

      if (InputRouting.includes(input) && router[input]) {
        const outputs = OutputRouting.filter(o => o in router[input] && (o !== "StreamMix2" || firmwareSupportsMix2()));
        return {
          mode: "send",
          rows: outputs.map(o => ({
            id: o, label: this.$t(`message.routing.outputs.${o}`), on: router[input][o], disabled: !canRoute(input, o),
            toggle: () => this.setRoute(input, o, !router[input][o]),
          })),
        };
      }
      if (channel === "Headphones" || channel === "LineOut") {
        const inputs = InputRouting.filter(i => router[i] && channel in router[i]);
        return {
          mode: "hear",
          rows: inputs.map(i => ({
            id: i, label: this.$t(`message.routing.inputs.${i}`), on: router[i][channel], disabled: !canRoute(i, channel),
            toggle: () => this.setRoute(i, channel, !router[i][channel]),
          })),
        };
      }
      return {mode: null, rows: []};
    },
    setRoute(input, output, value) {
      this.device().router[input][output] = value;
      websocket.send_command(this.serial(), {"SetRouter": [input, output, value]});
    },

    /* ---------- Advanced ---------- */
    hasAdvanced() {
      const kind = this.selection.kind;
      if (kind === "channel") return this.submixVolume(this.selection.id) !== null;
      return ["fader", "knob", "fx", "preset", "cough"].includes(kind);
    },
    submixVolume(channel) {
      const submix = this.device().levels.submix;
      if (!submix || !submix.inputs || !(channel in submix.inputs)) return null;
      return submix.inputs[channel].volume;
    },
    setSubmixVolume(channel, value) {
      this.device().levels.submix.inputs[channel].volume = value;
      this.send("submix-" + channel, {"SetSubMixVolume": [channel, value]});
    },
    fineRows() {
      const item = this.selection.kind === "knob" ? this.selectedKnob() : this.selectedFx();
      if (!item.effect || !FINE[item.effect]) return [];
      const current = this.effect(item.effect);
      return FINE[item.effect].map(([key, min, max, command, i18n]) => ({
        key: key, min: min, max: max, command: command, effect: item.effect,
        label: this.$t(`message.effects.${item.i18n}.${i18n}`), value: current[key],
      }));
    },
    setFine(row, value) {
      this.effect(row.effect)[row.key] = value;
      const command = {};
      command[row.command] = value;
      this.send(row.command, command);
    },
    colourValue(input) {
      return input.substring(1).toUpperCase();
    },
    buttonLighting(button) {
      return this.device().lighting.buttons[button];
    },
    advancedButton() {
      const {kind, id} = this.selection;
      if (kind === "fx") return this.selectedFx().button;
      if (kind === "preset") return `EffectSelect${id}`;
      if (kind === "cough") return id === "bleep" ? "Bleep" : "Cough";
      return null;
    },
    setButtonColour(button, which, value) {
      const colours = this.buttonLighting(button).colours;
      colours[which] = this.colourValue(value);
      websocket.send_command(this.serial(), {"SetButtonColours": [button, colours.colour_one, colours.colour_two]});
    },
    setFaderColour(fader, which, value) {
      const colours = this.device().lighting.faders[fader].colours;
      colours[which] = this.colourValue(value);
      websocket.send_command(this.serial(), {"SetFaderColours": [fader, colours.colour_one, colours.colour_two]});
    },
    setFaderStyle(fader, style) {
      this.device().lighting.faders[fader].style = style;
      websocket.send_command(this.serial(), {"SetFaderDisplayStyle": [fader, style]});
    },
    setScreenColour(fader, value) {
      const target = ScribbleNames[fader];
      this.device().lighting.simple[target].colour_one = this.colourValue(value);
      websocket.send_command(this.serial(), {"SetSimpleColour": [target, this.colourValue(value)]});
    },
    setEncoderColour(knob, which, value) {
      const colours = this.device().lighting.encoders[knob.encoder];
      colours[which] = this.colourValue(value);
      // Argument order is right (colour one), left (colour two), knob (colour three)
      websocket.send_command(this.serial(), {"SetEncoderColour": [knob.encoder, colours.colour_one, colours.colour_two, colours.colour_three]});
    },
    endVolume() {
      // nothing to flush: send() always delivers the latest queued value
    },
    capBottom(fader) {
      return Math.round(this.volume(fader) / 255 * (262 - FADER_TRAVEL_PADDING));
    },
    faderDown(event, fader) {
      if (event.button !== 0 || this.drag) return;
      // Only grabbing the cap starts a drag; settings open from the screen above instead.
      if (event.target.closest(".cap")?.parentElement !== event.currentTarget) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      this.drag = {
        type: "fader", fader, pointerId: event.pointerId, y: event.clientY,
        volume: this.volume(fader), path: this.volumePath(fader),
        travel: event.currentTarget.getBoundingClientRect().height - FADER_TRAVEL_PADDING * this.fit,
        moved: false,
      };
    },
    faderMove(event, fader) {
      const drag = this.drag;
      if (!drag || drag.type !== "fader" || drag.fader !== fader || drag.pointerId !== event.pointerId) return;
      if (this.volumePath(fader) !== drag.path) {
        this.faderUp(event, fader);
        return;
      }
      const dy = drag.y - event.clientY;
      if (!drag.moved && Math.abs(dy) < 3) return;
      if (!drag.moved) {
        drag.moved = true;
        store.pausePatchPath(drag.path);
      }
      this.setVolume(fader, Math.max(0, Math.min(255, drag.volume + dy / drag.travel * 255)));
    },
    faderUp(event, fader) {
      const drag = this.drag;
      if (!drag || drag.type !== "fader" || drag.fader !== fader || drag.pointerId !== event.pointerId) return;
      if (drag.moved) store.resumePatchPath(drag.path);
      this.drag = null;
    },
    faderKey(event, fader) {
      const step = {ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 25, PageDown: -25}[event.key];
      if (step === undefined) return;
      event.preventDefault();
      this.setVolume(fader, this.volume(fader) + step);
    },
    // Meter styles bounce with the audio (Line In / Console have no level source and show the position)
    ledColour(fader, index) {
      const lighting = this.device().lighting.faders[fader];
      return ledColour({
        style: lighting.style, top: lighting.colours.colour_one, bottom: lighting.colours.colour_two,
        index, position: this.volume(fader) / 255, meter: this.faderMeter(fader),
      });
    },
    // The meter for whatever channel sits on this fader, scaled by the fader (so it never rises past the cap)
    faderMeter(fader) {
      const meter = this.meters[this.faderStatus(fader).channel];
      if (!meter) return null;
      if (this.isMutedToAll(fader)) return {level: 0, peak: 0};
      const scale = this.volume(fader) / 255;
      return {level: meter.level * scale, peak: meter.peak * scale};
    },
    // The screen as the device draws it (the daemon renders the same image it sends to the hardware)
    scribbleUrl(fader) {
      const s = this.faderStatus(fader).scribble;
      const query = `?i=${s.file_name}&b=${s.bottom_text}&l=${s.left_text}&in=${s.inverted}`;
      return `${getBaseHTTPAddress()}files/scribble/${this.serial()}/${fader}.png${query}`;
    },
    screenStyle(fader) {
      if (this.isMini) return {};
      const colour = this.device().lighting.simple[ScribbleNames[fader]].colour_one;
      return {background: this.mixHex(colour, "ffffff", 0.7)};
    },

    isMuted(fader) {
      return this.faderStatus(fader).mute_state !== "Unmuted";
    },
    isMutedToAll(fader) {
      return this.faderStatus(fader).mute_state === "MutedToAll";
    },
    muteStyle(fader) {
      const lighting = this.device().lighting.buttons[MuteButtonNamesForFader[fader]];
      const colour = this.offStyleColour(lighting, this.isMuted(fader));
      return {borderColor: colour, color: colour};
    },
    toggleMute(fader) {
      const status = this.faderStatus(fader);
      const next = status.mute_state !== "Unmuted" ? "Unmuted" : (status.mute_type === "All" ? "MutedToAll" : "MutedToX");
      status.mute_state = next;
      websocket.send_command(this.serial(), {"SetFaderMuteState": [fader, next]});
    },
    setFaderChannel(fader, channel) {
      assignFaderChannel(this.serial(), fader, channel);
    },
    setFaderMuteFunction(fader, fn) {
      websocket.send_command(this.serial(), {"SetFaderMuteFunction": [fader, fn]});
    },
    muteFunctionOptions(current) {
      const base = (channel) => this.$t('message.configuration.mute_behaviour.base', {channel: channel});
      const options = [
        {id: "All", label: this.$t('message.configuration.mute_behaviour.all')},
        {id: "ToStream", label: base(this.$t('message.channels.StreamMix'))},
        {id: "ToVoiceChat", label: base(this.$t('message.channels.ChatMic'))},
        {id: "ToPhones", label: base(this.$t('message.channels.Headphones'))},
        {id: "ToLineOut", label: base(this.$t('message.channels.LineOut'))},
      ];
      if (current === "ToStream2") options.push({id: "ToStream2", label: base(this.$t('message.channels.StreamMix2'))});
      if (current === "ToStreams") options.push({id: "ToStreams", label: this.$t('message.configuration.mute_behaviour.streams')});
      return options;
    },

    /* ---------- Effect knobs ---------- */
    effect(name) {
      return this.device().effects.current[name];
    },
    knobLabel(knob) {
      return this.$t(`message.effects.${knob.i18n}.title`);
    },
    selectedKnob() {
      return KNOBS.find(k => k.id === this.selection.id) || KNOBS[0];
    },
    // Returns {min, max, step} of the raw value the daemon stores for this knob
    knobRange(knob) {
      const current = this.device().effects.current;
      if (knob.id === "pitch") {
        const narrow = current.pitch.style === "Narrow";
        if (current.hard_tune.is_enabled) return narrow ? {min: -1, max: 1, step: 1} : {min: -2, max: 2, step: 1};
        return narrow ? {min: -24, max: 24, step: 2} : {min: -24, max: 24, step: 1};
      }
      if (knob.id === "gender") {
        const limit = {Narrow: 12, Medium: 25, Wide: 50}[current.gender.style] || 12;
        return {min: -limit, max: limit, step: 1};
      }
      return {min: 0, max: 100, step: 1};
    },
    knobPos(knob) {
      const r = this.knobRange(knob);
      return (this.effect(knob.effect).amount - r.min) / (r.max - r.min);
    },
    valueFromPos(knob, pos) {
      const r = this.knobRange(knob);
      const raw = r.min + Math.max(0, Math.min(1, pos)) * (r.max - r.min);
      return Math.max(r.min, Math.min(r.max, Math.round(raw / r.step) * r.step));
    },
    isSnapped(knob) {
      return knob.centred && this.effect(knob.effect).amount === 0;
    },
    knobValueText(knob) {
      const amount = this.effect(knob.effect).amount;
      if (knob.id === "pitch") {
        const current = this.device().effects.current;
        const semitones = current.hard_tune.is_enabled ? amount * 12 : (current.pitch.style === "Narrow" ? amount / 2 : amount);
        return (semitones > 0 ? "+" : "") + semitones;
      }
      if (knob.centred) return (amount > 0 ? "+" : "") + amount;
      return amount + "%";
    },
    knobRotation(knob) {
      return Math.round(-135 + this.knobPos(knob) * 270);
    },
    encoderColour(knob, which) {
      return this.hex(this.device().lighting.encoders[knob.encoder][which]);
    },
    knobDots(knob) {
      const colours = this.device().lighting.encoders[knob.encoder];
      const pos = this.knobPos(knob);
      const dots = [];
      for (let i = 0; i < KNOB_DOTS; i++) {
        const deg = 135 + i * 270 / (KNOB_DOTS - 1);
        const rad = deg * Math.PI / 180;
        let colour;
        if (knob.centred) {
          const level = Math.round((pos - 0.5) * (KNOB_DOTS - 1));
          const j = i - (KNOB_DOTS - 1) / 2;
          if (j === level) colour = "#ffffff";
          else if (level > 0 && j > 0 && j < level) colour = this.hex(colours.colour_one);
          else if (level < 0 && j < 0 && j > level) colour = this.hex(colours.colour_two);
          else colour = "#1d201f";
        } else {
          const level = Math.round(pos * (KNOB_DOTS - 1));
          colour = i === level ? "#ffffff" : (i < level ? this.hex(colours.colour_two) : this.hex(colours.colour_one));
        }
        dots.push({
          i: i, a: Math.round(deg + 90), colour: colour,
          x: Math.round(42 + 36 * Math.cos(rad)), y: Math.round(42 + 36 * Math.sin(rad)),
          glow: colour === "#1d201f" ? "none" : `0 0 4px ${colour}`,
        });
      }
      return dots;
    },
    knobPath(knob) {
      return `/mixers/${this.serial()}/effects/current/${knob.effect}/amount`;
    },
    setKnobValue(knob, value) {
      if (this.effect(knob.effect).amount === value) return;
      this.effect(knob.effect).amount = value;
      const command = {};
      command[knob.amountCommand] = value;
      this.send(knob.amountCommand, command);
    },
    detent(pos) {
      const d = pos - 0.5;
      if (Math.abs(d) <= DETENT) return 0.5;
      return 0.5 + Math.sign(d) * (Math.abs(d) - DETENT) * 0.5 / (0.5 - DETENT);
    },
    undetent(pos) {
      const d = pos - 0.5;
      if (Math.abs(d) < 0.0001) return 0.5;
      return 0.5 + Math.sign(d) * (Math.abs(d) * (0.5 - DETENT) / 0.5 + DETENT);
    },
    knobDown(event, knob) {
      event.currentTarget.setPointerCapture(event.pointerId);
      const pos = this.knobPos(knob);
      this.drag = {type: "knob", id: knob.id, x: event.clientX, raw: knob.centred ? this.undetent(pos) : pos, moved: false};
    },
    knobMove(event, knob) {
      const drag = this.drag;
      if (!drag || drag.type !== "knob" || drag.id !== knob.id) return;
      const dx = event.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 3) return;
      if (!drag.moved) {
        drag.moved = true;
        this.dragKnob = knob.id;
        store.pausePatchPath(this.knobPath(knob));
      }
      const raw = Math.max(0, Math.min(1, drag.raw + dx / KNOB_DRAG_PX));
      this.setKnobValue(knob, this.valueFromPos(knob, knob.centred ? this.detent(raw) : raw));
    },
    knobUp(knob) {
      const drag = this.drag;
      this.drag = null;
      this.dragKnob = null;
      if (drag && drag.moved) store.resumePatchPath(this.knobPath(knob));
    },
    // Enter / Space on a focused knob opens its settings (a mouse uses the name underneath)
    knobClick(event, knob) {
      if (event.detail === 0) this.select("knob", knob.id);
    },
    panelKnobInput(knob, pos) {
      if (knob.centred && Math.abs(pos - 0.5) <= DETENT / 2) pos = 0.5;
      this.setKnobValue(knob, this.valueFromPos(knob, pos));
    },
    endKnob() {
      // send() always delivers the final value
    },
    resetKnob(knob) {
      this.setKnobValue(knob, knob.centred ? 0 : this.knobRange(knob).min);
    },
    knobKey(event, knob) {
      const dir = {ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1}[event.key];
      if (dir === undefined) return;
      event.preventDefault();
      const r = this.knobRange(knob);
      const amount = this.effect(knob.effect).amount;
      let next = Math.max(r.min, Math.min(r.max, amount + dir * r.step));
      // keyboard stops on the centre once before passing through it
      if (knob.centred && amount !== 0 && Math.sign(amount) !== Math.sign(next)) next = 0;
      this.setKnobValue(knob, next);
    },
    styleLabel(item, style) {
      return this.$t(`message.effects.${item.i18n}.styles.${style.charAt(0).toLowerCase() + style.slice(1)}`);
    },
    setEffectStyle(item, style) {
      const command = {};
      command[item.styleCommand] = style;
      websocket.send_command(this.serial(), command);
    },

    /* ---------- Presets and effect buttons ---------- */
    presetName(n) {
      const names = this.device().effects.preset_names;
      return names[`Preset${n}`] || `Preset ${n}`;
    },
    presetStyle(n) {
      const lighting = this.device().lighting.buttons[`EffectSelect${n}`];
      const colour = this.offStyleColour(lighting, this.device().effects.active_preset === `Preset${n}`);
      return {borderColor: colour, color: colour};
    },
    pressPreset(n) {
      websocket.send_command(this.serial(), {"SetActiveEffectPreset": `Preset${n}`});
    },
    selectedFx() {
      return FX_BUTTONS.find(f => f.id === this.selection.id) || FX_BUTTONS[0];
    },
    fxLabel(fx) {
      return fx.i18n ? this.$t(`message.lighting.effects.buttons.effect.${fx.i18n}`) : this.$t('message.lighting.effects.buttons.effect.fx');
    },
    fxEnabled(fx) {
      return fx.effect ? this.effect(fx.effect).is_enabled : this.device().effects.is_enabled;
    },
    fxStyle(fx) {
      const colour = this.offStyleColour(this.device().lighting.buttons[fx.button], this.fxEnabled(fx));
      return {borderColor: colour, color: colour};
    },
    pressFx(fx) {
      const command = {};
      command[fx.toggleCommand] = !this.fxEnabled(fx);
      websocket.send_command(this.serial(), command);
    },
    setFxAmount(fx, value) {
      this.effect(fx.effect).amount = value;
      const command = {};
      command[fx.amountCommand] = value;
      this.send(fx.amountCommand, command);
    },

    /* ---------- Sampler ---------- */
    activeBank() {
      return this.device().sampler.active_bank;
    },
    bankStyle(bank) {
      const colour = this.offStyleColour(this.device().lighting.sampler[`SamplerSelect${bank}`], this.activeBank() === bank);
      return {borderColor: colour, color: colour};
    },
    pressBank(bank) {
      websocket.send_command(this.serial(), {"SetActiveSamplerBank": bank});
    },
    // Like pressing the pad on the GoXLR (plays its next sample, if it has one)
    pressPad(pad) {
      websocket.send_command(this.serial(), {"PlayNextSample": [this.activeBank(), pad.id]});
    },
    dropSamples(event) {
      this.sampleDragDepth = 0;
      this.importSamples(Array.from(event.dataTransfer.files));
    },
    chooseSamples(event) {
      const files = Array.from(event.target.files);
      event.target.value = "";
      this.importSamples(files);
    },
    async waitForSample(serial, bank, pad, name = null) {
      const deadline = Date.now() + 120000;
      while (Date.now() < deadline) {
        const response = await websocket.get_status();
        const sampler = response.Status?.mixers[serial]?.sampler;
        if (!sampler) throw new Error(this.$t('message.device.sampleDeviceDisconnected'));
        store.replaceData(response);
        const state = sampler.processing_state;
        if (state.progress === null) {
          if (name && state.last_error) throw new Error(state.last_error);
          if (!name || sampler.banks[bank][pad].samples.some(sample => sample.name === name)) return;
        }
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      throw new Error(this.$t('message.device.sampleImportTimeout'));
    },
    async importSamples(files) {
      if (!files.length || this.sampleImport.busy || this.sampleDeleteBusy || this.selection.kind !== "pad") return;
      // Freeze the destination: switching banks or panels during import never retargets files.
      const serial = this.serial(), bank = this.activeBank(), pad = this.selection.id;
      this.sampleError = "";
      this.sampleImport = { busy: true, done: 0, total: files.length, added: 0, current: "", errors: [] };
      try {
        for (const file of files) {
          this.sampleImport.current = file.name;
          try {
            if (!/\.(wav|mp3|ogg|flac)$/i.test(file.name)) throw new Error(this.$t('message.device.sampleFormatsOnly'));
            if (file.size > 128 * 1024 * 1024) throw new Error(this.$t('message.device.sampleSizeLimit'));
            await this.waitForSample(serial, bank, pad);
            const body = new FormData();
            body.append("file", file, file.name);
            const response = await fetch(getBaseHTTPAddress() + "sample-upload", { method: "POST", body });
            const result = await response.json();
            if (!response.ok || result.Error || !result.name) throw new Error(result.Error || this.$t('message.device.sampleUploadFailed'));
            await websocket.send_command(serial, { ClearSampleProcessError: [] });
            await websocket.send_command(serial, { AddSample: [bank, pad, result.name] });
            // AddSample starts asynchronous gain calculation; wait before sending the next one.
            await this.waitForSample(serial, bank, pad, result.name);
            this.sampleImport.added++;
          } catch (error) {
            this.sampleImport.errors.push(file.name + ": " + (error.message || String(error)));
          }
          this.sampleImport.done++;
        }
      } finally {
        this.sampleImport.busy = false;
      }
    },
    async removePadSample(index) {
      if (this.sampleImport.busy || this.sampleDeleteBusy) return;
      const serial = this.serial(), bank = this.activeBank(), pad = this.selection.id;
      this.sampleDeleteBusy = true;
      this.sampleError = "";
      try {
        await websocket.send_command(serial, { RemoveSampleByIndex: [bank, pad, index] });
        store.replaceData(await websocket.get_status());
      } catch (error) {
        this.sampleError = error.message || String(error);
      } finally {
        this.sampleDeleteBusy = false;
      }
    },
    padSamples(pad) {
      return this.device().sampler.banks[this.activeBank()][pad].samples;
    },
    padLabel(pad) {
      const count = this.padSamples(pad.id).length;
      return `${this.$t(`message.sampler.banks.buttons.${pad.id.charAt(0).toLowerCase() + pad.id.slice(1)}`)}, ${count ? count : this.$t('message.device.noSample')}`;
    },
    samplerColours() {
      return this.device().lighting.sampler[`SamplerSelect${this.activeBank()}`].colours;
    },
    // Pads and Clear share the bank's colours; 'colour three' is the empty / idle colour, and a
    // very dark one is lifted to grey so the pad is still visible (same as the original visualiser)
    samplerIdleColour() {
      const three = this.samplerColours().colour_three;
      const r = parseInt(three.substring(0, 2), 16), g = parseInt(three.substring(2, 4), 16), b = parseInt(three.substring(4, 6), 16);
      return (r < 125 && r === g && g === b) ? "rgba(125, 125, 125, 0.4)" : this.rgba(three, 0.4);
    },
    padStyle(pad) {
      const colours = this.samplerColours();
      const button = this.device().sampler.banks[this.activeBank()][pad];
      if (button.samples.length === 0) return {borderColor: this.samplerIdleColour()};
      if (button.is_playing || button.is_recording) return {borderColor: this.hex(colours.colour_one), boxShadow: `0 0 10px ${this.hex(colours.colour_one)}`};
      return {borderColor: this.rgba(colours.colour_one, 0.7)};
    },
    clearStyle() {
      const colour = this.device().sampler.clear_active ? this.hex(this.samplerColours().colour_one) : this.samplerIdleColour();
      return {borderColor: colour, color: colour};
    },

    /* ---------- Cough / Bleep ---------- */
    cough() {
      return this.device().cough_button;
    },
    coughIsHold() {
      return !this.cough().is_toggle;
    },
    coughStyle() {
      const colour = this.offStyleColour(this.device().lighting.buttons.Cough, this.cough().state !== "Unmuted");
      return {background: colour, color: colour};
    },
    bleepStyle() {
      const colour = this.offStyleColour(this.device().lighting.buttons.Bleep, this.device().button_down.Bleep);
      return {borderColor: colour, color: colour};
    },
    setCoughHold(hold) {
      websocket.send_command(this.serial(), {"SetCoughIsHold": hold});
    },
    setCoughMuteFunction(fn) {
      websocket.send_command(this.serial(), {"SetCoughMuteFunction": fn});
    },
    toggleCoughMute() {
      const next = this.cough().state !== "Unmuted" ? "Unmuted" : (this.cough().mute_type === "All" ? "MutedToAll" : "MutedToX");
      websocket.send_command(this.serial(), {"SetCoughMuteState": next});
    },
    bleepPercent() {
      return Math.round((this.device().levels.bleep + 36) / 36 * 100);
    },
    setBleep(value) {
      this.device().levels.bleep = value;
      this.send("bleep", {"SetSwearButtonVolume": value});
    },

    /* ---------- Panel header ---------- */
    panelKind() {
      const kind = this.selection.kind;
      if (kind === "fader") return this.$t('message.device.kinds.fader', {n: this.faders.indexOf(this.selection.id) + 1});
      return this.$t(`message.device.kinds.${kind}`);
    },
    panelTitle() {
      const {kind, id} = this.selection;
      if (kind === "fader") return this.channelLabel(id);
      if (kind === "channel") return this.$t(`message.channels.${id}`);
      if (kind === "knob") return this.knobLabel(this.selectedKnob());
      if (kind === "fx") return this.fxLabel(this.selectedFx());
      if (kind === "preset") return this.presetName(id);
      if (kind === "pad") return `${this.activeBank()} · ${this.$t(`message.sampler.banks.buttons.${id.charAt(0).toLowerCase() + id.slice(1)}`)}`;
      if (kind === "clear") return this.$t('message.common.clear');
      return this.$t('message.lighting.cough.title');
    },
    panelColour() {
      const {kind, id} = this.selection;
      if (kind === "fader") return this.hex(this.device().lighting.faders[id].colours.colour_two);
      if (kind === "channel") return "#c3ccc8";
      if (kind === "knob") return this.encoderColour(this.selectedKnob(), "colour_two");
      if (kind === "fx") return this.hex(this.device().lighting.buttons[this.selectedFx().button].colours.colour_one);
      if (kind === "preset") return this.hex(this.device().lighting.buttons[`EffectSelect${id}`].colours.colour_one);
      if (kind === "pad" || kind === "clear") return this.hex(this.samplerColours().colour_one);
      return this.hex(this.device().lighting.buttons.Cough.colours.colour_one);
    },
  },
}
</script>

<style scoped>
/* The device is the whole page: it sits under a soft spotlight and fills the space; settings slide in on the right */
.deviceHome {
  position: relative;
  display: flex;
  height: calc(100vh - 64px);
  min-height: 420px;
  box-sizing: border-box;
  color: #e8ecea;
  background: radial-gradient(ellipse 60% 55% at 50% 42%, #27302f 0%, #1d2221 48%, #171b1a 100%);
}

/* Device view: nothing but the device on a see-through window */
.deviceHome.bare {
  height: 100vh;
  min-height: 0;
  background: none;
}

.bare .deviceColumn {
  padding: 0 18px 20px;
}

/* A smaller shadow that fits inside the window (a bigger one gets cut off at its edges) */
.bare .scroller {
  place-items: start center;   /* right under the window buttons, so they sit close to the device */
  filter: drop-shadow(0 6px 9px rgba(0, 0, 0, .45));
}

.bare .zoomChip {
  display: none;
}

.deviceColumn {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 20px 16px;
}

.topBar {
  display: flex;
  align-items: center;
  height: 24px;
}

.help {
  position: relative;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border: 1px solid #3a413f;
  border-radius: 50%;
  font-size: 12px;
  color: #9aa4a0;
  cursor: help;
}

.help .tip {
  display: none;
  position: absolute;
  z-index: 20;
  left: 30px;
  top: -4px;
  width: 300px;
  padding: 8px 10px;
  border: 1px solid #3a413f;
  border-radius: 6px;
  background: #2b302f;
  color: #e8ecea;
  font-size: 13px;
  line-height: 1.45;
}

.help:hover .tip, .help:focus .tip {
  display: block;
}

.help:focus-visible {
  outline: 2px solid #59b1b6;
}

.scroller {
  flex: 1 1 0;
  min-height: 0;
  display: grid;
  place-items: center;
  overflow: auto;
  filter: drop-shadow(0 22px 26px rgba(0, 0, 0, .45));
}

</style>

<style scoped src="./deviceShell.css"></style>

<style scoped>
/* ---------- Settings panel ---------- */
.panel {
  flex: 1 1 300px;
  max-width: 380px;
  min-width: 0;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #2d3230;
  border-radius: 10px;
  align-self: flex-start;
}

.panelHead {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panelHead .swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
}

.panelHead .kind {
  font-size: 12px;
  color: #9aa4a0;
}

.panelHead h2 {
  margin: 2px 0 0;
  font-size: 22px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
}

.closePanel {
  margin-left: auto;
  align-self: flex-start;
  width: 32px;
  height: 32px;
  flex: none;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: none;
  color: #9aa4a0;
  font-size: 16px;
}

.closePanel:hover {
  background: #3b413f;
  color: #fff;
}

/* The panel slides in from the right; the device column shrinks (and the device refits) as it does */
.panelSlot {
  flex: none;
  width: 0;
  overflow: hidden;
  visibility: hidden;
  border-left: 1px solid #2e3432;
  background: #1f2423;
  transition: width .24s ease, visibility 0s linear .24s;
}

.panelSlot.open {
  width: 360px;
  visibility: visible;
  transition: width .24s ease;
}

.panelSlot .panel {
  width: 360px;
  max-width: none;
  height: 100%;
  overflow-y: auto;
  border-radius: 0;
  background: transparent;
}

@media (max-width: 900px) {
  .panelSlot {
    position: absolute;
    z-index: 15;
    top: 0;
    right: 0;
    bottom: 0;
    box-shadow: -12px 0 40px rgba(0, 0, 0, .55);
  }
}

/* ---------- Right-click menu ---------- */
.ctxMenu {
  position: fixed;
  z-index: 50;
  min-width: 210px;
  padding: 5px;
  border: 1px solid #4a5452;
  border-radius: 8px;
  background: #2b302f;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .6);
  font-size: 13px;
}

.ctxTitle {
  padding: 6px 10px 4px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 700;
  font-size: 11px;
  color: #9aa4a0;
}

.ctxMenu button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 7px 10px;
  border: 0;
  border-radius: 5px;
  background: none;
  color: #e8ecea;
  text-align: left;
  font-size: 13px;
}

.ctxMenu button:hover, .ctxMenu button:focus-visible {
  background: rgba(62, 230, 217, .12);
  outline: none;
}

.ctxMenu small {
  color: #9aa4a0;
  font-size: 12px;
}

.ctxMenu hr {
  margin: 4px 2px;
  border: 0;
  border-top: 1px solid #3a413f;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label, .field .label {
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 13px;
  color: #c3ccc8;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.value {
  color: #59b1b6;
}

.panel input[type=range] {
  accent-color: #59b1b6;
}

.panel select, .action {
  min-height: 40px;
  border-radius: 6px;
  border: 1px solid #3b413f;
  background: #3b413f;
  color: #fff;
  padding: 0 10px;
  font-size: 14px;
  font-family: var(--goxlr-font);
}

.action:hover {
  border-color: #59b1b6;
}

.toggleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 6px;
  background: #3b413f;
}

.toggleRow input {
  width: 20px;
  height: 20px;
  accent-color: #59b1b6;
}

.segmented {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.segmented button {
  min-height: 40px;
  border-radius: 6px;
  border: 1px solid #3b413f;
  background: #3b413f;
  color: #c3ccc8;
  font-size: 14px;
}

.segmented button[aria-pressed=true] {
  border-color: #59b1b6;
  color: #fff;
  text-shadow: 0 0 3px #59b1b6;
}

.sampleDrop {
  padding: 14px;
  border: 1px dashed #59615d;
  border-radius: 8px;
  transition: border-color 0.15s, background 0.15s;
}
.sampleDrop.dragover {
  border-color: #59b1b6;
  background: rgba(89, 177, 182, 0.1);
}
.sampleDropHint, .sampleProgress {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #c5ceca;
}
.sampleFormats {
  margin: 0;
  color: #9aa4a0;
  font-size: 11px;
}
.addSamples {
  align-self: flex-start;
  padding: 8px 12px;
  border: 1px solid #59b1b6;
  border-radius: 5px;
  background: transparent;
  color: #c5e6e8;
  font: inherit;
  font-size: 13px;
}
.sampleName {
  min-width: 0;
  overflow-wrap: anywhere;
  flex: 1;
}
.removeSample {
  flex: 0 0 28px;
  padding: 2px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #c5ceca;
  font-size: 22px;
  line-height: 24px;
}
.removeSample:hover { background: #5b3535; color: #fff; }
.addSamples:disabled, .removeSample:disabled { opacity: 0.5; cursor: default; }
.sampleProgress span { display: block; overflow-wrap: anywhere; color: #9aa4a0; }
.sampleErrors, .sampleError { margin: 0; color: #f1a5a5; font-size: 12px; overflow-wrap: anywhere; }
.sampleErrors { padding-left: 18px; }
.samples {
  max-height: 260px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.samples li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background: #3b413f;
  font-size: 14px;
}

.samples li.empty {
  color: #9aa4a0;
}

.more {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #9aa4a0;
}

/* ---------- Not on a fader: a strip of small chips under the device ---------- */
.others {
  flex: none;
  margin-top: 8px;
}

.othersHead {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.othersHead h2 {
  margin: 0;
  font-size: 13px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  color: #c3ccc8;
}

.othersHead span {
  font-size: 12px;
  color: #9aa4a0;
}

.othersGrid {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.otherChip {
  flex: 1 0 130px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px 10px;
  border-radius: 8px;
  background: rgba(29, 34, 33, .85);
  border: 1px solid #343b39;
}

.otherChip:hover {
  border-color: #4a5452;
}

.otherChip.selected {
  border-color: #3ee6d9;
  box-shadow: none !important;
}

.otherName {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #c3ccc8;
  text-align: left;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
}

.otherName:hover span {
  color: #3ee6d9;
}

.output .otherName {
  color: #d9c48a;
}

.otherName span {
  flex: 1 1 auto;
  white-space: nowrap;
}

.otherName small {
  font-family: var(--goxlr-font);
  letter-spacing: 0;
  text-transform: none;
  font-weight: 400;
  font-size: 11px;
  color: #9aa4a0;
  font-variant-numeric: tabular-nums;
}

/* A thin level bar you can drag; the thumb only shows on hover */
.otherBar {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  margin: 0;
  border-radius: 2px;
  background: linear-gradient(90deg, #59b1b6 var(--fill), #2f3534 var(--fill));
  cursor: pointer;
}

.otherBar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e8ecea;
  opacity: 0;
  transition: opacity .15s ease;
}

.otherChip:hover .otherBar::-webkit-slider-thumb, .otherBar:focus-visible::-webkit-slider-thumb {
  opacity: 1;
}

.otherBar:focus-visible {
  outline: 2px solid #59b1b6;
  outline-offset: 4px;
}

/* ---------- Panel extras ---------- */
.segmented.four {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.segmented.four button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 52px;
  color: #fff;
}

.segmented.four small {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  color: #9aa4a0;
}

.routes {
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.routes legend {
  padding: 0;
  margin-bottom: 8px;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 13px;
  color: #c3ccc8;
}

.routeRow {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 6px;
  background: #3b413f;
  font-size: 14px;
  cursor: pointer;
}

.routeRow input {
  width: 18px;
  height: 18px;
  accent-color: #59b1b6;
}

.routeRow.disabled {
  opacity: 0.45;
  cursor: default;
}

.advanced {
  border-top: 1px solid #3b413f;
  padding-top: 6px;
}

.advancedToggle {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 42px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #c3ccc8;
  font-family: var(--goxlr-title-font);
  letter-spacing: var(--goxlr-title-spacing);
  text-transform: uppercase;
  font-weight: 600;
  font-size: 13px;
}

.advancedToggle span {
  flex: 1 1 auto;
  text-align: left;
}

.advancedToggle .chevron {
  transition: transform 0.15s;
}

.advancedToggle .chevron.flipped {
  transform: rotate(180deg);
}

.advancedBody {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 8px;
}

.fine {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #c3ccc8;
}

.fine input {
  min-width: 0;
  accent-color: #59b1b6;
}

.fine .value {
  text-align: right;
}

.colours {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}


</style>
