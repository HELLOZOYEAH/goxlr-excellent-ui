/*  Check out https://vue-i18n.intlify.dev/guide/essentials/syntax for a syntax guide.

    This export will be directly included in the main structure, with the relevant language flag, all
    that needs to be worried about here are the messages, and any applicable language modifiers.

    Note, this file is for English (British)

    I'm being as verbose as possible with the strings, while there are a lot of common answers for things
    like buttons (Yes, No, Ok, Cancel, etc), I'm a little paranoid some languages may need more contextual
    answers, so they're all individually labelled here.

    If you're editing, or creating a new language, everything inside quotation marks ("text") is translatable,
    Anything wrapped in curly brackets ({text}) is a variable, do NOT translate that!

    Also, feel free to leave your name as a contributor:
 */

///
/// Authors:
/// FrostyCoolSlug
///


export default {
    message: {
        noDevice: {
            tryAgain: "Try again",
            remoteOpening: "Opening {host}'s GoXLR…",
            remoteFailed: "Couldn't open {host}'s GoXLR. Check that the GoXLR daemon is running there and that both PCs have the latest GoXLR Link.",
            openRemote: "Open {host}'s GoXLR",
            remoteBanner: "Controlling {host} · over GoXLR Link",
            back: "Back",
            linkedStatus: "● Linked · {host}",
            linkedTitle: "GOXLR ON {host}",
            linkedHint: "Your GoXLR is plugged into {host}. GoXLR Link brings its voice and sampler here.",
            status: "○ No GoXLR on this PC",
            title: "NO GOXLR FOUND",
            hint: "It lights up here the moment a GoXLR is plugged in.",
            tipUsb: "Check the USB cable and that the GoXLR has power.",
            tipOtherPc: "On your other PC? That's fine. GoXLR Link plugs its voice and sampler in here.",
            tipSave: "Moving it between PCs? Save your profile first.",
        },
        link: {
            syncTitle: "SYNC",
            syncHint: "Profiles and sounds stay the same on both PCs",
            syncThisPc: "This PC",
            syncOtherPc: "Other PC",
            syncGoxlrThere: "Linked",
            syncOff: "Off",
            syncOffSince: "Off · last synced {ago}",
            syncPaused: "Sync off",
            syncPeerOff: "{pc} is off",
            syncCopying: "Copying {n} files…",
            syncStarting: "Comparing files…",
            syncUpToDate: "Up to date · {ago}",
            syncProfiles: "Profiles",
            syncMicProfiles: "Mic profiles",
            syncSounds: "Sounds",
            syncExtras: "Presets and icons",
            syncOffHere: "Not synced",
            syncFiles: "{n} files",
            syncFilesSize: "{n} files · {size}",
            syncBackups: "Replaced or deleted files are kept in link-backups for 30 days",
            syncHostLine: "Files synced with the gaming PC {ago}",
            findCode: "Type the pairing code shown on {host}",
            findTitle: "Found on this network",
            findLooking: "Looking for your GoXLR on this network…",
            findNone: "No streaming PC answered. Is GoXLR Link running on the PC with the GoXLR?",
            findAgain: "Search again",
            findLink: "Link",
            findLinked: "Selected",
            pullHint: "Pull the controller out to pop it into its own window",
            linkSettings: "LINK SETTINGS",
            keySwitches: "{key} switches",
            controllerEmpty: "Your GoXLR is on another PC? Open GoXLR Link here to plug in its voice and sampler.",
            intro: "Send your GoXLR voice, with live effects, into games on another PC.",
            popOut: "Pop out",
            dockBack: "Dock back",
            poppedOut: "GoXLR Link is popped out",
            poppedOutHint: "It keeps running in its own small window.",
            popOutBlocked: "This window can't open a pop-out. Open the GoXLR app in your browser to use Pop out.",
            thisPcStream: "This PC: stream PC",
            thisPcGaming: "This PC: gaming PC",
            thisPcBoth: "This PC: stream + gaming (test)",
            sendingChatMic: "Sending Chat Mic",
            fxOn: "{fx} on",
            noGamingPc: "No gaming PC yet",
            pairingCodeIs: "Pairing code {code} · type it in GoXLR Link on the gaming PC",
            connectedDetail: "Connected · {ms} ms · game mic: {mic}",
            live: "Live",
            samplerFromGamingPc: "Sampler from the gaming PC",
            playsOnGoxlr: "plays on your GoXLR",
            noSampleYet: "Nothing played from the gaming PC yet",
            lastSample: "Last: “{name}” · {ago}",
            secondsAgo: "{n} s ago",
            minutesAgo: "{n} min ago",
            notRunningHere: "GoXLR Link isn't running on this PC",
            howToStart: "Streaming PC: run “goxlr-link.exe host”. Gaming PC: open GoXLR Link.",
            noAppThere: "No GoXLR app on the other PC?",
            installLink: "Install the small GoXLR Link app there instead.",
            getLink: "Get GoXLR Link",
            getLinkSoon: "Comes with the installer (not ready yet)",
            settings: "Settings",
            notRunning: "GoXLR Link isn't running on this PC.",
            getVbCable: "Get VB-Cable",
            streamingPc: "Streaming PC (IP address)",
            pairingCode: "Pairing code",
            paired: "Paired. Type a new code to change it",
            pairingHint: "Shown on the streaming PC when GoXLR Link runs there.",
            backupMic: "Backup mic",
            windowsDefault: "Windows default mic",
            fallback: "Switch to the backup mic if the streaming PC drops",
            hotkey: "Hotkey to switch the game mic",
            discordTitle: "In Discord and games, pick \"GoXLR Link Mic\" as your mic",
            discordTips: "Discord: set Noise Suppression to None and turn off Echo Cancellation and Automatic Gain Control, or the effects and the sampler get cut.",
            language: "Language",
            gameMic: "GAME MIC",
            whatTeamHears: "What your team hears",
            goxlrVoice: "GoXLR voice",
            thisPcMic: "This PC's mic",
            fxOff: "FX off",
            noEffects: "No effects on",
            sending: "Sending",
            hotkeyHint: "{key} switches, even in a game.",
            sampler: "SAMPLER",
            samePads: "Same pads as your GoXLR",
            bank: "Sampler bank",
            emptyPad: "Empty",
            stop: "Stop",
            samplerWaiting: "The pads appear once the streaming PC is linked.",
            offline: "○ Not running",
            notLinked: "○ Not linked",
            linkedTo: "● Linked to {host}",
            linked: "● Linked",
            linkedNoAudio: "● Linked · no audio yet",
            goxlrLive: "GoXLR voice · live from the streaming PC",
            backupThisPc: "{name} · this PC",
            goxlrHint: "Turn the knobs on the GoXLR and your team hears it.",
            fellBack: "The streaming PC went quiet, so your team hears this mic until it's back.",
            plainVoice: "Plain voice, no GoXLR effects.",
        },
        // For these, the keys map directly to their GoXLR Channel Names
        channels: {
            All: "All",
            Mic: "Microphone",
            Chat: "Voice Chat",
            Music: "Music",
            Game: "Game",
            Console: "Console",
            LineIn: "Line In",
            System: "System",
            Sample: "Samples",
            LineOut: "Line Out",
            Headphones: "Headphones",
            MicMonitor: "Mic Monitor",
            StreamMix: "Stream Mix",
            StreamMix1: "Stream Mix 1",
            StreamMix2: "Stream Mix 2",
            ChatMic: "Chat Mic",
            Sampler: "Sampler",
            VOD: "VOD",
        },

        faders: {
            A: "Channel 1",
            B: "Channel 2",
            C: "Channel 3",
            D: "Channel 4"
        },

        suffixes: {
            decibels: "dB",
            percentage: "%",
            milliseconds: "ms",
            hertz: "Hz",
            kilohertz: "KHz",
            ratio: ":{value}",
            beatsPerMinute: "BPM",
        },

        modalButtons: {
            ok: "Ok",
            yes: "Yes",
            no: "No",
            cancel: "Cancel",
            continue: "Continue",
            close: "Close",
        },

        common: {
            close: "Close",
            clear: "Clear",
            collapseSection: "Collapse Section",
            expandSection: "Expand Section",
            activeProfile: "Active Profile",
            switchDevice: "Switch Device",
            removeSample: "Remove Sample",
            waterfallAnimationUp: "Waterfall Animation Up",
            waterfallAnimationDown: "Waterfall Animation Down",
            unknown: "Unknown",
            tabList: "Tab list",
        },

        // These Strings appear in the tabs throughout the pages
        navigation: {
            screens: "Screens",
            // Tabs at the top of the Page
            menu: "Menu",
            unsaved: "Changed but not saved: open this menu and press Save, or the change is lost when the GoXLR is unplugged",
            profiles: "Profiles",
            presets: "Presets",
            samples: "Samples",

            // Main Navigation Tabs
            microphone: "Mic",
            mixer: "Mixer",
            configuration: "Configuration",
            effects: "Effects",
            sampler: "Sampler",
            lighting: "Lighting",
            lightingFaders: "Fader lights",
            routing: "Routing",
            system: "System",

            // Navigation Sections on the Lighting Page
            lightingGlobal: "Global",
            lightingMixer: "Mixer",
            lightingEffects: "Effects",
            lightingSampler: "Sampler",
            lightingCough: "Cough",

            // Accessibility Messages (these are announced to screen readers)
            accessibilityProfileSection: "Profiles and Files",
            accessibilityDeviceSection: "Device Settings",
            accessibilityLightingSection: "Lighting Settings",
        },

        // Screens page (mockup docs/mockups/2026-10-30-screens)
        screens: {
            title: "Screens",
            hint: "Make the four screens on your GoXLR your own. Pick a screen, then show its channel name, your own words, or a picture or GIF. What you see here is what the real screens show.",
            mini: "The GoXLR Mini has no screens.",
            pick: "Pick a screen",
            screenN: "Screen {n}",
            faderN: "Fader {n}",
            show: "Show on this screen",
            modes: {
                name: "Channel name", nameHint: "Like today",
                text: "Your words", textHint: "Type anything",
                image: "Picture or GIF", imageHint: "Moving pictures too",
            },
            nameNote: "Shows the channel on this fader and its icon, made by the daemon like today. Change the channel or icon on the <b>Configuration</b> page.",
            text: "Text",
            font: "Font",
            fonts: { pixel: "Pixel (sharp dots)", title: "Rajdhani (like the app)", body: "Play" },
            size: "Size",
            align: "Align",
            aligns: { left: "Left", center: "Centre", right: "Right" },
            tooLong: "If it's too long",
            longs: { shrink: "Shrink", scroll: "Scroll" },
            lightBackground: "Light background, dark letters",
            bold: "Bold",
            dropHere: "Drop a GIF, PNG or JPG here",
            becomesDots: "It becomes 128 × 64 dots, black and white",
            chooseFile: "Choose a file",
            noFile: "No picture yet. Pick a file to see it here.",
            savedPicture: "Saved picture: {name}. Pick a file to change it.",
            cantRead: "Couldn't read {file}. Try a GIF, PNG or JPG.",
            tooLongKeeping: "too long: keeping {from}–{to} s",
            merged: "{n} too-fast pictures merged",
            whichPart: "Which 10 seconds to keep",
            fit: "Fit",
            fits: { fit: "Whole picture", fill: "Fill the screen" },
            shading: "Shading",
            sharp: "Sharp",
            dotted: "Dotted (dither)",
            cutoff: "Brightness cut-off",
            speed: "Speed",
            swap: "Swap lit and unlit",
            still: "A still picture.",
            loopInfo: "{n} pictures, {s} s a loop. The real screen gets at most 20 pictures a second.",
            colour: "Screen colour",
            colourAll: "All 4 screens",
            colourOne: "This screen",
            colourAllLabel: "All screens",
            colourHint: "Changes right away. Save your profile to keep it.",
            tooDark: "This light colour is very dark, so the real screen looks black, whatever it shows.",
            makeBright: "Use bright blue",
            thisScreen: "This screen",
            closeUp: "Close up",
            backToName: "Back to name",
            nameAgain: "This screen shows its channel name again (after Save).",
            save: "Save to GoXLR",
            saving: "Saving…",
            saved: "Saved. Your GoXLR shows these screens now.",
            saveFailed: "Couldn't save: {reason}",
            lineUp: "Line up the screens",
            lineUpSub: "So pictures line up from screen to screen",
            gap: "Gap between screens",
            dots: "{n} dots",
            testLine: "Show a test line on the real screens",
            lineUpNote: "Measured on a GoXLR: each screen is 18 × 12 mm and there are 7 mm between screens, so the gap is <b>50 dots</b>. Turn on the test line and move the slider until the line looks straight across all four real screens.",
        },

        // Device view: the device floating on its own (mockup docs/mockups/2026-10-29-device-view)
        deviceView: {
            openApp: "Open app",
            minimise: "Minimise",
            maximise: "Maximise",
            close: "Close to the tray",
            wheelPick: "Pick what the mouse wheel changes",
            wheelChanges: "The mouse wheel changes",
            keepTurning: "Keep turning to change it",
            button: "Device view",
            buttonTitle: "Show only the device, floating on the desktop",
            startIn: "Start in device view",
            startInHint: "The app opens as the device only. Click a part, or Open app, for everything.",
        },

        // Strings for the Device page (realistic GoXLR you can drag and click)
        device: {
            rightClickSettings: "Right-click for its settings",
            bleepHint: "Hold Bleep on the GoXLR. Right-click for its settings.",
            tab: "Device",
            title: "Your GoXLR",
            hint: "Drag the faders and knobs on the device, the real ones follow. To set one up, click its screen or name, or right-click it. Click outside the device to close the settings.",
            settings: "Settings",
            closeSettings: "Close settings",
            editScreen: "Change this screen",
            textColour: "Text colour",
            textDark: "Dark",
            textLight: "Light",
            openIcons: "Open the icons folder (add your own pictures here)",
            menu: {
                changeChannel: "Change channel",
                muteButton: "Mute button does",
                mute: "Mute",
                unmute: "Unmute",
                fullVolume: "Set volume to 100%",
                changeStyle: "Change style",
                resetCentre: "Reset to centre",
                resetZero: "Reset to 0",
                clickScreen: "click screen",
                clickName: "click name",
                doubleClick: "double-click",
            },
            knobHint: "Drag left / right · double-click to reset",
            muteChannel: "Mute {channel}",
            volume: "Volume",
            channel: "Channel on this fader",
            muteButton: "Mute button does",
            style: "Style",
            amount: "Amount",
            reset: "Reset",
            effectOn: "Effect on",
            presetHelp: "Press a preset button to load its whole effects setup: the four knobs, Megaphone, Robot and Hard Tune.",
            samplesOnPad: "Samples on this pad",
            dropSamples: "Drop audio files here — you can add several at once.",
            addSamples: "Add audio files",
            removeSample: "Remove {name} from this pad",
            sampleSizeLimit: "128 MB per file",
            sampleFormatsOnly: "Use WAV, MP3, OGG or FLAC files.",
            importingSamples: "Adding {current} of {total}…",
            samplesImported: "Added {count} audio files.",
            sampleUploadFailed: "Could not upload this audio file.",
            sampleImportTimeout: "Audio processing took too long.",
            sampleDeviceDisconnected: "The GoXLR is disconnected.",
            noSample: "No sample on this pad",
            clearHelp: "Hold Clear and press a pad to remove its sample.",
            muteMic: "Mute mic now",
            unmuteMic: "Unmute mic",
            bleepVolume: "Bleep volume",
            moreIn: "More settings in the {tab} tab.",
            notOnFader: "Not on a fader",
            notOnFaderHint: "Every channel and output is still one click away",
            input: "Input",
            output: "Output",
            putOnFader: "Put on hardware fader",
            sendTo: "Send to",
            hearHere: "You hear here",
            advanced: "Advanced",
            lightStyle: "Fader light style",
            mixB: "Mix B level",
            faderStyles: {
                TwoColour: "Two colours",
                Gradient: "Gradient",
                Meter: "Meter",
                GradientMeter: "Gradient + meter",
            },
            simple: "Simple",
            micHint: "Simple by default. Open ⋮ on any card for the advanced controls.",
            showAllAdvanced: "Show all advanced",
            effectsHint: "Pick a preset and turn the four knobs. Open Fine controls on any card for every detail.",
            fxHint: "Turns all effects on or off.",
            allControls: "All controls",
            inputLevel: "Input level",
            showMeter: "Show level",
            stopMeter: "Stop",
            meterHint: "Press Show level and talk normally: aim to stay out of the red.",
            gateHint: "Cuts room noise when you are not talking",
            eqHint: "Shape the tone of your voice",
            compressorHint: "Evens out loud and quiet moments",
            extrasHint: "De-esser and the bleep sound",
            backToSimple: "Back to simple",
            moreControls: "{n} more controls",
            bandsLikeOriginal: "{n} bands, like the original",
            strength: "Strength",
            levelQuiet: "Quiet",
            aimZone: "Aim for the dashed zone while talking",
            changeMicSetup: "Change mic setup",
            liveInput: "Live input",
            levelGood: "Good level",
            levelLoud: "Too loud",
            levelLow: "A bit quiet",
            levelSilent: "Silent",
            aimHere: "Aim here when talking",
            gateLine: "Gate opens above this line (drag)",
            gateGraph: "Gate open / closed",
            compGraph: "In → Out",
            showBands: "Show {n} bands",
            nBands: "{n} bands",
            fineTuneFreqs: "Fine-tune frequencies",
            resetFlat: "Reset to flat",
            spectrumLive: "Live · {name}",
            spectrumDenied: "Mic access blocked",
            spectrumNoInput: "No input for the graph",
            spectrumFill: "Spectrum: fill",
            spectrumBars: "Spectrum: bars",
            spectrumOff: "Spectrum: off",
            peakHold: "Peak hold",
            spectrumInput: "Listen to {name}",
            showAdvancedN: "Show advanced ({n})",
            cardOptions: "{name} options",
            lower: "Lower",
            raise: "Raise",
            eqDrag: "Drag a point up or down. Click a point, then use − / + or the arrow keys.",
            eqDragFine: "Drag up or down for level, left or right to move the frequency.",
            eqRanges: {
                subBass: "Sub bass",
                bass: "Bass",
                lowMids: "Low mids",
                midRange: "Mid range",
                upperMids: "Upper mids",
                highs: "Highs",
            },
            denoise: "Denoise",
            denoiseHint: "AI noise removal for your mic only",
            denoiseUnavailable: "This daemon build has no Denoise yet. Your normal routing is not changed.",
            denoiseChecking: "Checking outputs… Open setup to refresh the list.",
            denoiseTimeout: "Denoise did not start in time. It stays off.",
            denoiseStillOn: "Could not switch Denoise off, so setup was not saved.",
            denoiseSetupRequired: "Setup required",
            denoiseChooseSend: "Choose an app output first",
            denoiseChooseReturn: "Choose monitor return first",
            denoiseStarting: "Starting…",
            denoiseWorking: "Working…",
            denoiseFailed: "Denoise could not change. Try again.",
            denoiseMegaphoneBypass: "Filtering paused to preserve Megaphone/Radio",
            denoiseSetup: "Setup",
            denoiseSendOutput: "Send to",
            denoiseSendOutputHint: "Apps then pick the matching input as their microphone. Your Chat Mic and Stream Mix are not filtered.",
            denoiseMonitorReturn: "Monitor return",
            denoiseMonitorReturnHint: "This GoXLR channel is used only for the clean voice while Monitor is on.",
            denoiseNotSet: "Not set",
            denoiseSave: "Save setup",
            denoiseRefresh: "Refresh list",
            comingSoon: "Coming soon",
            denoiseSend: "Send",
            denoiseSendHint: "Clean voice to the app input you choose",
            denoiseMonitor: "Monitor",
            denoiseMonitorHint: "Hear the clean voice in your headphones",
            denoiseNote: "Both stay off until Denoise is ready. Your normal routing is not changed.",
            fineControls: "Fine controls",
            nMore: "{n} more",
            voiceEffects: "Voice effects",
            on: "on",
            off: "off",
            mixerHint: "Drag a fader to set the level. A lit icon under a channel means its sound goes there.",
            chatMicBlocked: "Voice Chat can't be sent to Chat Mic",
            levelByChannels: "Level set by the channels",
            listenInHeadphones: "Listen to this mix in headphones",
            hardwareFaderLegend: "Teal edge = on a hardware fader (has Mute)",
            mixBToggle: "Mix B (submix)",
            level: "Level",
            mixALevel: "Mix A level",
            mixBLevel: "Mix B level",
            mute: "Mute",
            muteNeedsFader: "Only channels on a hardware fader have a mute button. Untick its routes to silence it.",
            routingFootnote: "Filled dot = the channel is sent there. Voice Chat can't go to Chat Mic, so that dot is dimmed. Channels not on a fader have no mute button: untick their dots instead.",
            samplerHint: "Pick a bank, click a pad, then set what it plays.",
            padTitle: "{pad} pad",
            bankN: "Bank {bank}",
            whenPressed: "When pressed",
            samplesOnPad: "Samples on this pad",
            sampleCount: "{n} sample | {n} samples",
            emptyPad: "Empty",
            noSamplesYet: "No samples yet. Add one, or record by holding the pad on your GoXLR.",
            trimHint: "Drag the handles to trim",
            playSample: "Play {name}",
            removeSample: "Remove {name}",
            pickSample: "Pick a sample above to see its waveform",
            clipRed: "Red",
            clipLegend: "= too loud, will distort",
            peak: "Peak",
            average: "Average",
            levelVerdict: {
                good: "Good level",
                close: "Very close to clipping",
                clipping: "Clipping, lower the gain",
                quiet: "Quiet",
            },
            gainPerFile: "Applies to this file everywhere it's used",
            duplicate: "Duplicate",
            duplicateHint: "This file is on this pad more than once, and both share one gain",
            configHint: "Choose what each fader controls and where its mute button mutes to. Holding a mute button always mutes to all.",
            muteTo: "Mute to",
            muteAll: "All",
            micMuteButton: "Mic mute button",
            mutesMicTo: "Mutes mic to",
            kinds: {
                channel: "Channel",
                fader: "Fader {n}",
                knob: "Effect knob",
                fx: "Effect button",
                preset: "Effect preset",
                pad: "Sample pad",
                clear: "Sampler",
                cough: "Mic mute buttons",
            },
        },

        // Strings that appear in the Mic tab, note that the Profile Strings are handled in 'profileManager'
        microphone: {
            profiles: {
                title: "Mic Profiles"
            },

            setup: {
                button: "Mic Setup",
                title: "Mic Setup",
                type: "Mic Type",
                gain: "Gain",

                // Microphone Types
                xlr: "XLR Microphone",
                phantom: "XLR + Phantom (+{voltage}V)",
                jack: "3.5mm",
            },

            waveform: {
                loud: "Too Loud",
                good: "Good",
                gate_estimated: "Gate is Estimated"
            },

            gate: {
                title: "Gate",
                threshold: "Threshold",
                attenuation: "Attenuation",
                attack: "Attack",
                release: "Release",
            },

            equaliser: {
                title: "Equaliser",
                reset: "Reset",
                enableFineTune: "Enable Fine Tune",
                bass: "Bass",
                mid: "Mid",
                treble: "Treble",
            },

            compressor: {
                title: "Compressor",
                amount: "Amount",
                threshold: "Threshold",
                ratio: "Ratio",
                attack: "Attack",
                release: "Release",
                makeUpGain: "Make-Up Gain",
            },

            extras: {
                title: "Extras",
                deEsser: "De-Esser",
                bleep: "Bleep",
            }
        },

        mixer: {
            // Box Headers
            inputs: "Inputs",
            outputs: "Outputs",
            onYourGoxlr: "On your GoXLR",
            otherChannels: "Other channels",
            output: "Output",
            appOutput: "Output · no apps",
            appMove: "Move {app}",
            appPlaying: "Making sound",
            appDrop: "Drop an app here",
            appMoveTo: "Move to {channel}",
            appWindowsDefault: "Back to Windows' default",
            appMoved: "{app} now plays through {channel}. If you don't hear it there, restart {app}.",
            appMovedDefault: "{app} follows Windows' default output again.",
            appMoveFailed: "Couldn't move {app}: {reason}",
            appYourMic: "Your mic",
            appFromCable: "From a cable",
            appsElsewhere: "Apps not on the GoXLR",
            // Redesigned Mixer page (mockup docs/mockups/2026-10-29-mixer)
            pageHint: "One card per sound. Set how loud it is, mute it, drag apps into it, and pick where it goes. With Mix B on, each sound gets a second volume, so your stream can hear a different balance from you.",
            mixBSameSwitch: "Same switch as the Routing page",
            oneMix: "One mix",
            oneMixHint: "Every output hears the same volumes. Turn on Mix B to give your stream (or another output) its own balance.",
            mixATitle: "Mix A · the fader volume",
            mixBTitle: "Mix B · a second volume",
            playsIn: "Plays in: {outputs}",
            nothing: "nothing",
            nothingYet: "nothing yet. Pick B on an output below.",
            sounds: "Sounds",
            soundsHelp: "Faders 1 to 4 on your GoXLR come first. Moving the A volume moves the real fader.",
            soundsSub: "Drag the volumes, drag apps between cards",
            showWhere: "Show where sounds go",
            faderN: "Fader {n}",
            noFader: "No fader",
            volume: "Volume",
            noMeter: "No level reading for this sound",
            bFollowsA: "B follows A",
            bOnItsOwn: "B on its own",
            linkTitle: "When on, B moves with A and keeps the same gap",
            mute: "Mute",
            muted: "Muted",
            muteOnlyFader: "The GoXLR can only mute sounds on a fader",
            needsFader: "Needs a fader",
            muteHow: {
                All: "Mutes everywhere",
                ToStream: "Mutes to Stream only",
                ToVoiceChat: "Mutes to Chat Mic only",
                ToPhones: "Mutes to Headphones only",
                ToLineOut: "Mutes to Line Out only",
                ToStream2: "Mutes to Stream 2 only",
                ToStreams: "Mutes to both Streams",
            },
            lampOnTitle: "Turn the light off if you don't use this sound",
            lampOffTitle: "Not in use. Click to turn the light back on.",
            inUse: "in use",
            markedNotInUse: "marked not in use",
            notInUse: "Not in use",
            stillToStream: "still goes to Stream",
            lampOffDone: "{sound} is greyed out. Its sound still plays where \"Goes to\" sends it.",
            lampOnDone: "{sound} is back in use.",
            apps: "Apps",
            appsClosedMic: "Your mic. No apps.",
            appsClosedJack: "Jack on the GoXLR. No apps.",
            goesTo: "Goes to",
            nobodyHears: "Nobody hears this",
            chatLocked: "Chat can't go to Chat Mic. People on calls would hear themselves.",
            chatLockedTitle: "Locked: people on calls would hear themselves",
            outputsSub: "Where sound comes out, and which mix each one plays",
            noOwnVolume: "No volume of its own.",
            setBySounds: "Set by the sound cards.",
            playsMix: "Plays mix",
            listen: "Listen",
            listening: "Listening",
            listenTitle: "Play this output in your headphones",
            listenNow: "Your headphones now play {output}, so you hear what it hears.",
            listenBack: "Your headphones play the Headphones mix again.",
            hears: "Hears: {sounds}",
            micMonitorWho: "How loud you hear your own mic.",
            appsElsewhereSub: "Playing through another sound device. Drag one onto a sound card above to move it.",
            appsElsewhereEmpty: "Drag an app here to send it back to its own device",
            soundName: {
                Mic: "Mic", Chat: "Chat", Music: "Music", Game: "Game", Console: "Console",
                LineIn: "Line In", System: "System", Sample: "Samples",
            },
            soundWhat: {
                Mic: "Your voice", Chat: "Voice calls", Music: "Music apps", Game: "Your game",
                Console: "Console jack", LineIn: "Line In jack", System: "Windows sounds", Sample: "Sampler pads",
            },
            outputName: {
                Headphones: "Headphones", LineOut: "Line Out", MicMonitor: "Mic Monitor", BroadcastMix: "Stream",
                StreamMix2: "Stream 2", ChatMic: "Chat Mic", Sampler: "Sampler",
            },
            outputShort: {
                Headphones: "Phones", BroadcastMix: "Stream", StreamMix2: "Stream 2", LineOut: "Line Out",
                ChatMic: "Chat Mic", Sampler: "Sampler",
            },
            outputWhat: {
                Headphones: "What you hear", LineOut: "Speakers or 2nd PC", MicMonitor: "Your mic in your headphones",
                BroadcastMix: "Your viewers and recordings", StreamMix2: "A second stream mix",
                ChatMic: "What people on calls hear", Sampler: "What a pad records",
            },
            mixAssignment: "Mix Assignment",

            // Submix Checkbox
            submix: "Submixes",

            // Mix Assignment
            channelA: "A",
            channelB: "B"
        },

        // Strings in the Configuration Tab
        configuration: {
            // This is common between Faders and Cough Buttons
            mute_behaviour: {
                base: "Mute to {channel}",
                all: "Mute to All",

                stream: "Mute to @:message.channels.StreamMix",
                stream1: "Mute to @:message.channels.StreamMix1",
                stream2: "Mute to @:message.channels.StreamMix2",
                streams: "Mute to @:message.channels.StreamMix 1 + 2",
                chatMic: "Mute to @:message.channels.ChatMic",
                headphones: "Mute to @:message.channels.Headphones",
                lineOut: "Mute to @:message.channels.LineOut",
            },
            muteBehaviourTitle: "Mute Behaviour",
            muteBehaviourLabel: "Mute Behaviour for {channel}",

            // Config for the Faders
            faders: {
                title: "Faders",
                channelTitle: "Channel",
                sourceTitle: "Source",
                sourceLabel: "Source for {channel}",
            },

            // Configuration for the Cough Button
            cough: {
                behaviour: {
                    hold: "Hold",
                    toggle: "Toggle",
                },

                title: "Cough Button Settings",
                behaviourTitle: "Button Behaviour",
            }
        },

        effects: {
            preset: {
                title: "Preset",
                group: "Group",

                menuLoad: "Load",
                menuRename: "Rename",
                menuSave: "Save to Library",


                loadPreset: "Load Preset",

                renamePresetTitle: "Rename Preset",
                renamePresetPlaceholder: "New Preset Name",
                renamePresetOk: "@:message.modalButtons.ok",
                renamePresetCancel: "@:message.modalButtons.cancel",

                noPresets: "There are currently no presets in the library, save or copy some for them to appear here.",
                loadPresetOk: "@:message.modalButtons.ok",

                confirmTitle: "Confirm Preset Load",
                confirmMessage: "Loading this preset will replace any unsaved changes on this effects bank, would you like to proceed?",
                confirmOk: "@:message.modalButtons.ok",
                confirmCancel: "@:message.modalButtons.cancel",

                overwriteTitle: "Confirm Preset Overwrite",
                overwriteMessage: "The preset {current} already exists in your library, would you like to overwrite?",
                overwriteConfirm: "Overwrite",
                overwriteCancel: "@:message.modalButtons.cancel",

                accessibilityOpenPresetDirectory: "Open Presets Directory",
                accessibilityPresetLoaded: "Preset {name} loaded to {bank}",
                accessibilityPresetSaved: "Preset {name} saved to Library",
            },
            reverb: {
                title: "Reverb",
                style: "Style",

                styles: {
                    library: "Library",
                    darkBloom: "Dark Bloom",
                    musicClub: "Music Club",
                    realPlate: "Real Plate",
                    chapel: "Chapel",
                    hockeyArena: "Hockey Arena"
                },

                amount: "Amount",
                decay: "Decay",
                earlyLevel: "Early Level",
                tailLevel: "Tail Level",
                preDelay: "Predelay",
                lowColour: "Lo Colour",
                highColour: "Hi Colour",
                highFactor: "Hi Factor",
                diffuse: "Diffuse",
                modSpeed: "ModSpeed",
                modDepth: "ModDepth"
            },

            echo: {
                title: "Echo",

                style: "Style",
                styles: {
                    quarter: "Quarter",
                    eighth: "Eighth",
                    triplet: "Triplet",
                    pingPong: "Ping Pong",
                    classicSlap: "Classic Slap",
                    multiTap: "MultiTap"
                },

                amount: "Amount",
                feedback: "Feedback",
                tempo: "Tempo",
                delayLeft: "Delay L",
                delayRight: "Delay R",
                feedbackLeft: "Feedback L",
                feedbackRight: "Feedback R",
                xfbLeftToRight: "XFB L to R",
                xfbRightToLeft: "XFB R to L",
            },

            pitch: {
                title: "Pitch",

                style: "Style",
                styles: {
                    narrow: "Narrow",
                    wide: "Wide"
                },

                amount: "Amount",
                character: "Character"
            },

            gender: {
                title: "Gender",

                style: "Style",
                styles: {
                    narrow: "Narrow",
                    medium: "Medium",
                    wide: "Wide"
                },

                amount: "Amount"
            },

            megaphone: {
                title: "Megaphone",

                style: "Style",
                styles: {
                    megaphone: "Megaphone",
                    radio: "Radio",
                    onThePhone: "On The Phone",
                    overdrive: "Overdrive",
                    buzzCutt: "Buzz Cutt",
                    tweed: "Tweed"
                },

                amount: "Amount",
                postGain: "Post Gain"
            },

            robot: {
                title: "Robot",

                style: "Style",
                styles: {
                    robot1: "Robot 1",
                    robot2: "Robot 2",
                    robot3: "Robot 3",
                },

                lowGain: "Low Gain",
                lowFrequency: "Low Freq",
                lowWidth: "Low Width",
                midGain: "Mid Gain",
                midFrequency: "Mid Freq",
                midWidth: "Mid Width",
                highGain: "Hi Gain",
                highFrequency: "Hi Freq",
                highWidth: "Hi Width",
                waveform: "Waveform",
                pulseWidth: "Pulse Width",
                threshold: "Threshold",
                dryMix: "Dry Mix",
            },

            hardTune: {
                title: "Hard Tune",

                style: "Style",
                styles: {
                    natural: "Natural",
                    medium: "Medium",
                    hard: "Hard"
                },

                amount: "Amount",
                rate: "Rate",
                window: "Window",

                source: "Source"
            }
        },

        sampler: {
            bankTitle: "Bank",
            banks: {
                bankTitle: "Bank",
                bank: {
                    a: "A",
                    b: "B",
                    c: "C"
                },
                buttonTitle: "Button",
                buttonLabel: "Button for bank {activeBank}",
                buttons: {
                    topLeft: "Top Left",
                    topRight: "Top Right",
                    bottomLeft: "Bottom Left",
                    bottomRight: "Bottom Right",
                },

                functionTitle: "Function",
                functionLabel: "Function for {activeButton} button in bank {activeBank}",
                functions: {
                    playNext: "Play / Next",
                    playStop: "Play / Stop",
                    playFade: "Play / Fade Out",
                    stopOnRelease: "Stop on Release",
                    fadeOnRelease: "Fade on Release",
                    loop: "Loop"
                },

                playOrderTitle: "Play Order",
                playOrderLabel: "Play Order for {activeButton} button in bank {activeBank}",
                playOrders: {
                    sequential: "Sequential",
                    random: "Random",
                },
            },

            samplesTitle: "Samples",
            dropToAdd: "Drop to add to {pad}",
            orDropFiles: "or drop audio files here",
            samples: {
                samplesTitle: "Samples",
                samplesLabel: "Sample for {activeButton} button in bank {activeBank}",

                // Button at the bottom of the Sample List
                addSample: "+",
                addSampleLabel: "Add Sample",
                sampleSelector: {
                    parentDirectory: "Parent Directory",
                    addButton: "Add",

                    noSamples: "There are currently no samples in the samples folder. Copy some over so they can be selected here!",

                    // Used with Screen Readers
                    directories: "Directories",
                    samples: "Samples",
                },

                gain: "Gain",
                waveform: {
                    title: "Waveform",

                    // These are primarily for accessibility, but are labels on the various buttons.
                    text: "Waveform for {sample}",

                    // The Play / Stop button before the waveform
                    playbackSample: "Play Sample",
                    stopSample: "Stop Sample",

                    // Labels for the draggable 'Handles'
                    sampleStart: "Sample Start",
                    sampleEnd: "Sample End",

                    sampleDeleted: "Sample {sampleName} has been deleted from {activeButton} button in bank {activeBank}",
                    zoomLevel: "Zoom Level: {level}",
                },

                addSampleWaitTitle: "Please Wait",
                addSampleAnalysing: "Please wait while the sample is being analysed.",
                addSampleProgress: "Progress: {progress}@:message.suffixes.percentage",

                errorTitle: "Error Adding Sample",
                errorText: "An error occurred while adding the sample to the bank:",
                genericError: "An unknown error occurred.",

                accessibilityOpenSamplesDirectory: "Open Samples Directory",
                accessibilityAnalysing: "Please wait, analysing sample. This process may take a couple of minutes.",
                accessibilityAdded: "Sample {name} added to {activeButton} button in bank {activeBank}."
            }
        },

        lighting: {
            undo: "Undo",
            undoHint: "Undo the last colour change (Ctrl+Z)",
            faderLights: {
                title: "Fader lights",
                lede: "How the LEDs beside each fader light up on the GoXLR. Meter styles bounce with the sound on the device itself.",
                live: "Live",
                clickHint: "Click a fader to edit just that one",
                noLevel: "No live level in the app for this channel",
                applyTo: "Apply to",
                allFaders: "All faders",
                style: "Style",
                styles: {
                    TwoColour: {name: "Two colour", desc: "Bottom colour up to the fader, top colour above"},
                    Gradient: {name: "Gradient", desc: "Blends bottom to top, up to the fader"},
                    Meter: {name: "Meter", desc: "Top colour behind, the sound fills up in the bottom colour"},
                    GradientMeter: {name: "Gradient meter", desc: "Blended colours, bouncing with the sound"},
                },
                pairs: "Colour pairs",
                colours: "Colours",
                top: "Top",
                topHint: "Upper LEDs / loudest",
                bottom: "Bottom",
                bottomHint: "Lower LEDs / quiet",
                swap: "Swap",
                swapHint: "Swap the top and bottom colours",
                note: "Two colour and Gradient follow the fader's position. Meter and Gradient meter follow the audio going through that channel, so a quiet channel stays dark.",
                mute: {
                    title: "Mute buttons",
                    muted: "Muted",
                    mutedHint: "Lit when the channel is muted",
                    unmuted: "Not muted",
                    unmutedHint: "Used by the colour styles below",
                    match: "Match fader colours",
                    matchHint: "Each mute button takes its fader's colours: bottom when muted, top when not",
                    offStyle: "When not muted",
                },
                save: "Save to profile",
                saved: "All saved",
                unsaved: "Not saved: unplugging the GoXLR would lose this",
            },
            // Shared by the Global, Mixer, Effects, Sampler and Cough tabs
            shared: {
                whenOff: "When it is off",
                offStyles: {
                    Dimmed: {name: "Dim Active Colour", desc: "Off shows the on colour, dimmed"},
                    Colour2: {name: "Inactive Colour", desc: "Off shows a second colour"},
                    DimmedColour2: {name: "Dim Inactive Colour", desc: "Off shows the second colour, dimmed"},
                },
                on: "On",
                off: "Off",
                offHint: "Used by the colour styles below",
                swapHint: "Swap the on and off colours",
                clickButton: "Click a button to edit just that one",
                isOn: "on",
                isOff: "off",
            },
            globalTab: {
                title: "Global",
                lede: "The light animation, the logo light, and one button to paint the whole GoXLR a single colour.",
                hint: "The animation runs on the GoXLR too",
                animation: "Animation",
                modes: {
                    None: {name: "None", desc: "Colours stay still"},
                    RetroRainbow: {name: "Retro rainbow", desc: "Slow rainbow wash"},
                    RainbowBright: {name: "Rainbow bright", desc: "Full brightness rainbow"},
                    RainbowDark: {name: "Rainbow dark", desc: "Deeper rainbow"},
                    Simple: {name: "Simple", desc: "Your colours, gently moving"},
                    Ripple: {name: "Ripple", desc: "A wave across the device"},
                },
                tuning: "Animation tuning",
                mod1: "Speed (Mod 1)",
                mod2: "Spread (Mod 2)",
                waterfall: "Waterfall",
                water: {Up: "Up", Down: "Down", Off: "Off"},
                notUsed: "Not used by this animation",
                unsupported: "This GoXLR's firmware can't play light animations. Update the firmware to use them.",
                accent: "Accent",
                accentHint: "The GoXLR logo light",
                paint: "Paint everything",
                oneColour: "One colour",
                oneColourHint: "Every button, ring and fader",
                paintButton: "Paint every light",
                paintWarning: "Replaces the colours you set on every other tab. Undo brings them back.",
                note: "Speed and Spread change how the animation moves. Spread only works with the bright and dark rainbows. Waterfall makes the lights flow up or down.",
            },
            mixerTab: {
                title: "Mixer",
                lede: "The screen above each fader and the mute button under it.",
                screen: "Screen",
                backlight: "Backlight",
                backlightHint: "The little screen above the fader",
                matchFader: "Match fader top colour",
                matchFaderHint: "Each screen takes the top colour of its own fader",
                notePrefix: "Mute buttons are the same setting as on Fader lights. The name, icon and number on each screen are set in",
            },
            effectsTab: {
                title: "Effects",
                lede: "Preset buttons 1 to 6, the rings around the four knobs, and the effect buttons.",
                clickHint: "Click a button or knob to edit just that one",
                part: "Part",
                parts: {presets: "Preset buttons", knobs: "Knobs", buttons: "Effect buttons"},
                all: {presets: "All presets", knobs: "All knobs", buttons: "All effect buttons"},
                preset: "Preset {n}",
                buttonNames: {megaphone: "Megaphone", robot: "Robot", hard_tune: "Hardtune", fx: "FX"},
                left: "Left of the dial",
                leftHint: "From zero up to the value",
                right: "Right of the dial",
                rightHint: "From the value to the end",
                knob: "Knob",
                knobHint: "The ring on the cap",
                knobNote: "Knobs have no off style: they are always lit.",
                onHint: {presets: "The preset you are on", buttons: "Effect switched on"},
                note: {
                    presets: "Only one preset is on at a time, so five of these always show the off look.",
                    buttons: "FX is the main effects switch. Megaphone, Robot and Hardtune light when they are on.",
                },
                onNowNone: "Nothing is on right now",
                onNowOne: "{name} is on right now",
                onNowMany: "{list} and {last} are on right now",
            },
            samplerTab: {
                title: "Sampler",
                lede: "The bank buttons A, B and C. The four pads and Clear take the colours of the bank you are on.",
                clickHint: "Click A, B or C to edit just that bank",
                bank: "Bank {bank}",
                allBanks: "All banks",
                pads: {TopLeft: "Top left", TopRight: "Top right", BottomLeft: "Bottom left", BottomRight: "Bottom right"},
                hasSounds: "Has sounds",
                empty: "Empty",
                inUse: "Bank {bank} is the one in use, so the pads show its colours",
                onHint: "Bank in use, pads with sounds",
                offHint: "The other banks",
                emptyPads: "Empty pads",
                emptyHint: "Pads with no sound (black = dark)",
                note: "The four pads and Clear always follow the bank you are on. The GoXLR cannot give one pad its own colour.",
            },
            coughTab: {
                title: "Cough",
                lede: "The Bleep button and the big mic mute button.",
                both: "Both",
                bleep: "Bleep",
                cough: "Mic mute",
                onHint: "Pressed or muted",
                state: "Mic mute is {cough}, Bleep is {bleep}",
                note: "Red is the usual warning colour for a muted mic.",
            },
            // These are some common strings that are used in multiple places
            common: {
                colour: "Colour",

                activeColour: "Active",
                inactiveColour: "Inactive",

                inactiveOption: "Inactive Option",
                inactiveOptions: {
                    dimActiveColour: "Dim Active Colour",
                    inactiveColour: "Inactive Colour",
                    dimInactiveColour: "Dim Inactive Colour"

                },

                applyToAll: "Apply to All",
            },

            global: {
                areas: {
                    title: "Areas",

                    area: "Area",
                    areas: {
                        global: "Global",
                        accent: "Accent",
                    },

                    colour: "@:message.lighting.common.colour",
                },

                animations: {
                    title: "Animations",

                    mode: "Animation Mode",
                    modes: {
                        none: "None",
                        rainbowRetro: "Rainbow Retro",
                        rainbowBright: "Rainbow Bright",
                        rainbowDark: "Rainbow Dark",
                        simple: "Simple",
                        ripple: "Ripple",
                    },

                    mod1: "Gradient Mod 1",
                    mod2: "Gradient Mod 2",

                    waterfall: "Waterfall Settings",
                    waterfallOff: "Off",
                }
            },

            mixer: {
                faders: {
                    title: "@:message.configuration.faders.title",
                    channelTitle: "@:message.configuration.faders.channel",
                },

                fader: {
                    title: "Fader",

                    style: "Style",
                    styles: {
                        gradient: "Gradient",
                        meter: "Meter",
                    },

                    bottomColour: "Bottom Colour",
                    topColour: "Top Colour",

                    accessibilityTitle: "Fader settings for {channel}",
                },

                screen: {
                    title: "Screen",
                    backgroundColour: "Background Colour",
                    icons: "Icons",
                    iconNone: "-- NONE --",

                    optionsTitle: "Options",
                    options: {
                        showNumber: "Show Number",
                        invertDisplay: "Invert Display",
                        text: "Text",

                        accessibilityText: "Text to display on the GoXLR screen"
                    }
                },

                mute: {
                    // Pretty much all other fields for this area come from 'Common'
                    title: "Mute",
                    accessibilityTitle: "Mute Settings for {channel}"
                }
            },

            effects: {
                preset: {
                    title: "Preset Buttons",
                    presetTitle: "Preset"
                },

                encoders: {
                    title: "Encoders",

                    encoder: "Encoder",
                    encoders: {
                        reverb: "Reverb",
                        echo: "Echo",
                        pitch: "Pitch",
                        gender: "Gender",
                    },

                    leftColour: "Left Colour",
                    rightColour: "Right Colour",
                    knobColour: "Knob Colour"
                },

                buttons: {
                    title: "Effect Buttons",

                    effectTitle: "Effect",
                    effect: {
                        megaphone: "Megaphone",
                        robot: "Robot",
                        hardTune: "Hardtune",
                        fx: "Fx"
                    }
                },
            },
            sampler: {
                title: "Bank",

                buttonsTitle: "Buttons",
                buttons: {
                    a: "A",
                    b: "B",
                    c: "C"
                },

                active: "Active / Loaded",
                empty: "Sample Empty",
                inactive: "Inactive Bank",
            },

            cough: {
                title: "Cough/Bleep Buttons",

                buttonsTitle: "Buttons",
                buttons: {
                    bleep: "Bleep",
                    cough: "Cough",
                }
            },
        },

        routing: {
            // There are (frustratingly) some minor differences between how channels appear in the routing table,
            // and how they appear in the Mixer, these changes also fall under the hood at the Utility level, so
            // we'll define all the channels here, and 'fix' anything which needs adjustment.
            title: "Routing",

            input: "Inputs",
            inputs: {
                Microphone: "@:message.channels.Mic",
                Chat: "Chat",
                Music: "@:message.channels.Music",
                Game: "@:message.channels.Game",
                Console: "@:message.channels.Console",
                LineIn: "@:message.channels.LineIn",
                System: "@:message.channels.System",
                Samples: "@:message.channels.Sample",
            },

            output: "Outputs",
            outputs: {
                Headphones: "@:message.channels.Headphones",
                BroadcastMix: "@:message.channels.StreamMix",
                StreamMix2: "@:message.channels.StreamMix2",
                ChatMic: "@:message.channels.ChatMic",
                Sampler: "@:message.channels.Sampler",
                LineOut: "@:message.channels.LineOut",
                VOD: "@:message.channels.VOD",
            },
            // Redesigned Routing page (mockup docs/mockups/2026-10-29-routing)
            pageHint: "Pick who hears each sound. Each row is a place sound goes to, each column is a sound. Click a box to turn it on or off.",
            mixBSameSwitch: "Same switch as the Mixer page",
            micShort: "Mic",
            broadcast: "Broadcast Stream Mix",
            broadcast1: "Broadcast Stream Mix 1",
            whoHearsWhat: "Who hears what",
            gridHelp: "Routing only turns a sound on or off for each place. Volumes come from your faders.",
            hoverHint: "Hover a box to see what it means",
            soundsInputs: "Sounds (inputs)",
            goesToOutputs: "Goes to (outputs)",
            recording: "Recording",
            paused: "Paused",
            listenOn: "Your headphones play this",
            listenTo: "Listen to {name} in your headphones",
            listenBanner: "Your headphones are playing {name}, so you hear what that row sends. Changes to the Headphones row are saved and come back when you switch.",
            listenBack: "Listen to Headphones again",
            volumeSet: "{name} volume set",
            useMix: "Use Mix {mix} volumes",
            tip: "Tip",
            tipText: "Point at a box. This line tells you, in plain words, who hears what.",
            locked: "Locked",
            lockedText: "The GoXLR can't send Chat back into Chat Mic. People would hear their own voices.",
            on: "On",
            off: "Off",
            yourMic: "your mic",
            sentence: "{who} {sound}.",
            pausedNote: "Saved for later: your headphones are playing {name} right now.",
            listeningNote: "You hear this too, because you are listening to this row.",
            legendOn: "On",
            legendStream: "On, going to your stream",
            legendLocked: "Locked by the GoXLR",
            legendListen: "Listen: play this output in your headphones (one at a time)",
            legendMixOn: "A / B: which fader volumes this output uses (set on the Mixer page)",
            legendMixOff: "A / B volume sets appear when Mix B is on",
            plainWords: "In plain words",
            plainWordsSub: "Updates as you click",
            nothing: "nothing",
            notList: "Not: {list}",
            playingNow: "Playing in your headphones now",
            pausedWhile: "Paused while you listen to {name}",
            inputWhat: {
                Microphone: "Your voice",
                Chat: "Voice calls",
                Music: "Music apps",
                Game: "Your game",
                Console: "Console jack",
                LineIn: "Line In jack",
                System: "Windows sounds",
                Samples: "Sampler pads",
            },
            outputWhat: {
                Headphones: "What you hear",
                BroadcastMix: "Your viewers and recordings",
                StreamMix2: "A second stream mix",
                LineOut: "The Line Out jack (speakers, 2nd PC)",
                ChatMic: "What people on calls hear",
                Sampler: "What a pad records",
            },
            outputWho: {
                Headphones: "You hear",
                BroadcastMix: "Your viewers hear",
                StreamMix2: "Stream Mix 2 gets",
                LineOut: "Line Out plays",
                ChatMic: "People on calls hear",
                Sampler: "A new sample records",
            },
            outputWhoNot: {
                Headphones: "You don't hear",
                BroadcastMix: "Your viewers don't hear",
                StreamMix2: "Stream Mix 2 doesn't get",
                LineOut: "Line Out doesn't play",
                ChatMic: "People on calls don't hear",
                Sampler: "A new sample doesn't record",
            },
        },

        system: {
            title: "System",

            powerButton: "Power Action",
            power: {
                shutdownTitle: "Shutdown Actions",
                shutdownDescription: "These actions will be executed when the GoXLR Utility is safely shut down.",

                sleepTitle: "Sleep Actions",
                sleepDescription: "These actions will be executed when your system is going to Sleep.",

                wakeTitle: "Wake Actions",
                wakeDescription: "These actions will be executed when your system wakes from Sleep",

                settingsError: "The Configuration appears to have been manually modified. In order to prevent unexpected behaviours, this section has been disabled. To completely reset the shutdown actions, press the button below",
                settingsReset: "Reset Shutdown Actions",

                power_options: {
                    reload: "Reload Settings",
                    saveProfile: "Save Profile",
                    loadProfile: "Load Full Profile",
                    loadColourProfile: "Load Profile Colours",
                    saveMicProfile: "Save Mic Profile",
                    loadMicProfile: "Load Mic Profile",
                }
            },

            deviceButton: "Device Settings",
            device: {
                holdDuration: "Mute Button Hold to Mute All Duration",
                holdDurationAccessibility: "The duration in milliseconds that the mute button must be held to mute to all channels",

                sampleBuffer: "Sampler Pre-Record Buffer (in seconds)",
                sampleBufferAccessibility: "The duration in seconds that the sampler will record before the button is pressed",

                voiceDeafen: "Voice Chat Mute All also mutes Mic to Chat Mic",
                voiceDeafenAccessibility: "When muting Voice Chat to all channels, also mute the mic to chat mic",

                monitorWithFx: "Toggle Mic Monitoring with FX state",
                monitorWithFxAccessibility: "Activates Mic Monitoring when FX is enabled",

                resetSampleFunctionOnClear: "Reset Sample Function on Clear",
                resetSampleFunctionOnClearAccessibility: "Resets the Sample function to Start / Next when Cleared",

                lockFaders: "Lock fader positions when Muting to All",
                lockFadersAccessibility: "Prevents the faders from moving down when Mute to All is active",

                samplerFadeDuration: "Sampler Fade Duration",
                samplerFadeDurationAccessibility: "The duration in milliseconds that the sampler will fade out when playback is stopped",
            },

            settingsButton: "Settings",
            settings: {
                language: "Language",
                useSystem: "Use System Language (if available)",

                uiHandler: "UI Handler",
                uiHandlers: {
                    browser: "Browser",
                    app: "App",
                    custom: "Custom"
                },


                logLevel: "Log Level (requires restart)",
                logLevels: {
                    off: "Off",
                    error: "Error",
                    warn: "Warn",
                    info: "Info",
                    debug: "Debug",
                    trace: "Trace"

                    // OFF / ERROR / WARN / INFO / DEBUG / TRACE
                },

                firmwareSource: "Firmware Update Channel",
                firmwareSources: {
                    live: "Live",
                    beta: "Beta"
                },

                allowNetworkAccess: "Allow UI Network Access (requires restart)",
                allowNetworkAccessAccessibility: "Allow the UI to be accessed from other devices on the network",

                autoStart: "AutoStart on Login",
                autoStartAccessibility: "Start the GoXLR Utility when the user logs in",

                showOnLaunch: "Show UI on Launch",
                showOnLaunchAccessibility: "Automatically launches the UI on startup",

                showTray: "Show Tray Icon (requires restart)",
                showTrayAccessibility: "Show the GoXLR Utility icon in the system tray",

                ttsOnButton: "TTS on button press",
                ttsOnButtonAccessibility: "Speak the button status when pressed, either via screen reader or system TTS",

                recoverDefaults: "Recover Defaults",
                recoverOptions: {
                    profiles: "Profiles",
                    micProfiles: "Mic Profiles",
                    icons: "Icons",
                    presets: "Presets"
                },

                shutdownUtility: "Shutdown GoXLR Utility",

                shutdownConfirmTitle: "Are you Sure?",
                shutdownConfirmMessage: "Are you sure you want to Shutdown the GoXLR Utility?",

                settingsRegionAccessibility: "settings",

                macosAggregateManagement: "Disable MacOS Aggregate Management (requires restart)",
                macosAggregateManagementAccessibility: "Disabled Utility Aggregate Management on MacOS (requires restart)",
            },

            aboutButton: "About GoXLR",
            about: {
                serial: "Serial",
                utilityVersion: "Utility Version",
                driverVersion: "Driver Version",
                hardwareVersion: "Hardware Version",

                firmware: "Firmware",
                dice: "DICE",
                fpga: "FPGA",
            },

            firmwareUpdateButton: {
                update: "Update Firmware",
                downgrade: "Downgrade Firmware",
                reinstall: "Re-Install Firmware",
                custom: "Custom Firmware",
            },
            firmwareUpdate: {
                newVersionAvailable: "A newer firmware version ({latestVersion}) is available for your device.\nDo you want to update device now?",
                currentVersionIsNewer: "Your current firmware version ({currentVersion}) is newer than the latest available firmware version ({latestVersion}) for your device.\nDo you want to downgrade to the latest firmware version?",
                currentIsUpToDate: "Your firmware is already up to date.\nDo you want to reinstall the current firmware version?",
                customFirmware: "You are about to install a custom firmware.\nThis is not recommended unless you know what you are doing.\nAre you sure you want to continue?",

                warning: "You are about to flash a new firmware version to your device.\nThe developers of the GoXLR Utility are not responsible for any damage that can be caused by this process. ",
                warningInfo: "More Info",

                betaWarning: "You are about to install a beta firmware version.\nThis version will not receive any official support and may contain bugs or issues that we cannot fix.",

                updatePaused: "You are about to install firmware version {version}. Are you sure you want to continue?",
                updateInProgress: "Firmware Update in Progress. Please wait and do not disconnect your device!",
                completed: "The firmware update has completed successfully.",
                failed: "Something went wrong during the firmware update. Please try again.",

                changelog: "Version {version} Changelog:",
                title: "Installing Firmware...",

                progress: {
                    starting: "Starting...",
                    manifest: "Fetching Manifest...",
                    download: "Downloading Firmware...",
                    pause: "Update Paused",
                    clearNVR: "Preparing Update Partition...",
                    uploadFirmware: "Uploading Firmware...",
                    validateUpload: "Validating uploaded Firmware...",
                    hardwareWrite: "Writing Firmware...",
                    hardwareValidate: "Validating Firmware...",
                    complete: "Update complete",
                    failed: "Failed to complete Firmware Update",
                }
            },

            licenses: "Licenses",
            help: "Help",
        },

        deviceSelector: {
            title: "Select Device",
            connecting: "Attempting to Connect to the GoXLR Utility..",
            disconnected: "Unable to connect to the GoXLR Utility, please check it's running.\n\nThis page will automatically try to reconnect..",
            noDevices: "No GoXLR Devices Found",
        },

        versionCheck: {
            updateAvailable: "Update Available",
            firmwareDirectionAvailable: "Firmware {direction} Available",
            firmwareDirections: {
                update: "Update",
                downgrade: "Downgrade",
                unknown: "UNKNOWN",
            },
            incompatibleDriver: "The installed drivers are incompatible with this firmware, click here to download the latest driver.",
        },

        // Strings used in Profile and Microphone Profile Management.
        profileManager: {
            // Accessibility Titles for the buttons at the bottom of the Profile List
            saveProfileName: "Save Profile {profileName}",
            createProfile: "Create Profile",

            // Dialog Popup when clicking 'Create Profile' Button
            newTitle: "New Profile Source",
            newQuestion: "Would you like to create a new profile from the default, or current configuration?",
            newDefaultButton: "Default",
            newCurrentButton: "Current",
            newCancelButton: "@:message.modalButtons.cancel",

            // Dialog Popup when hitting the 'Save Profile' button
            overwriteTitle: "Overwrite Confirmation",
            overwriteQuestion: "Are you sure you want to overwrite the profile {activeProfile}?",
            overwriteYes: "@:message.modalButtons.yes",
            overwriteNo: "@:message.modalButtons.no",

            // Dialog Popup when clicking the 'Delete' Menu Item
            deleteTitle: "Delete Confirmation",
            deleteQuestion: "Are you sure you want to delete the profile {profileName}?",
            deleteYes: "@:message.modalButtons.yes",
            deleteNo: "@:message.modalButtons.no",

            // Dialog prompting for a new Profile Name
            newNameTitle: "Enter New Profile Name",
            newNamePlaceHolder: "New Name",
            newNameOk: "@:message.modalButtons.ok",
            newNameCancel: "@:message.modalButtons.cancel",

            // Dialog Popup when attempting to delete the active profile
            deleteCurrentErrorTitle: "Unable to Delete",
            deleteCurrentErrorMessage: "It is not possible to delete the active profile.",

            // Items in the Popup Menu on Profiles
            menuLoadProfile: "Load Profile",
            menuLoadProfileColours: "Load Colours Only",
            menuDuplicateProfile: "Duplicate Profile",
            duplicateTitle: "Duplicate {profileName}",
            duplicateName: "{profileName} Copy",
            menuDeleteProfile: "Delete Profile",


            // Accessibility Messages (these are announced to screen readers)
            accessibilityLoadedProfile: "Profile {profileName} loaded",
            accessibilityLoadedColours: "Profile {profileName} colours loaded",
            accessibilityCreatedProfile: "Created profile {profileName}",
            accessibilitySavedProfile: "Profile {profileName} Saved",
            accessibilitySavedProfileAs: "Profile {profileName} Saved as {newProfileName}",
            accessibilityProfileDeleted: "Profile {profileName} deleted",
            accessibilityActiveProfile: "Active Profile",
            accessibilityDropMenuTitle: "{profileName} options",
            accessibilityOpenProfileDirectory: "Open Profile Directory",
            accessibilityOpenMicProfileDirectory: "Open Mic Profile Directory",
        },
    }
}
