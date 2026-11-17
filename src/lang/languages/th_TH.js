/*  Check out https://vue-i18n.intlify.dev/guide/essentials/syntax for a syntax guide.

    Note, this file is for Thai (Thailand)

    Audio terms that Thai streamers normally use in English (Gain, Gate, Reverb, effect style
    names, etc.) are intentionally left untranslated so they match the hardware and manuals.

    Anything wrapped in curly brackets ({text}) is a variable, do NOT translate that!
 */

///
/// Authors:
/// Zhalich
///


export default {
    message: {
        noDevice: {
            tryAgain: "ลองอีกครั้ง",
            remoteOpening: "กำลังเปิด GoXLR ของ {host}…",
            remoteFailed: "เปิด GoXLR ของ {host} ไม่ได้ เช็กว่าเครื่องนั้นเปิด GoXLR daemon อยู่ และทั้งสองเครื่องใช้ GoXLR Link รุ่นล่าสุด",
            openRemote: "เปิด GoXLR ของ {host}",
            remoteBanner: "กำลังคุม {host} · ผ่าน GoXLR Link",
            back: "กลับ",
            linkedStatus: "● เชื่อมกับ {host}",
            linkedTitle: "GOXLR อยู่ที่ {host}",
            linkedHint: "GoXLR เสียบอยู่ที่ {host} แล้ว GoXLR Link ดึงเสียงและแซมเปลอร์มาใช้ที่นี่",
            status: "○ เครื่องนี้ไม่มี GoXLR",
            title: "ไม่เจอ GOXLR",
            hint: "เสียบ GoXLR เมื่อไร หน้านี้จะติดไฟทันที",
            tipUsb: "เช็กสาย USB และไฟเข้าเครื่อง GoXLR",
            tipOtherPc: "เสียบอยู่อีกเครื่อง? ไม่เป็นไร GoXLR Link ดึงเสียงและแซมเปลอร์มาใช้ที่นี่ได้",
            tipSave: "จะย้ายไปอีกเครื่อง? กด Save โปรไฟล์ก่อน",
        },
        link: {
            syncTitle: "SYNC",
            syncHint: "โปรไฟล์และเสียงเหมือนกันทั้งสองเครื่อง",
            syncThisPc: "เครื่องนี้",
            syncOtherPc: "อีกเครื่อง",
            syncGoxlrThere: "เชื่อมอยู่",
            syncOff: "ปิดอยู่",
            syncOffSince: "ปิดอยู่ · sync ล่าสุด {ago}",
            syncPaused: "ปิด sync",
            syncPeerOff: "{pc} ปิดอยู่",
            syncCopying: "กำลังส่ง {n} ไฟล์…",
            syncStarting: "กำลังเทียบไฟล์…",
            syncUpToDate: "ตรงกันแล้ว · {ago}",
            syncProfiles: "โปรไฟล์",
            syncMicProfiles: "โปรไฟล์ไมค์",
            syncSounds: "เสียง",
            syncExtras: "Preset และไอคอน",
            syncOffHere: "ไม่ sync",
            syncFiles: "{n} ไฟล์",
            syncFilesSize: "{n} ไฟล์ · {size}",
            syncBackups: "ไฟล์ที่ถูกทับหรือลบ เก็บไว้ใน link-backups 30 วัน",
            syncHostLine: "sync ไฟล์กับเครื่องเกมล่าสุด {ago}",
            findCode: "ใส่รหัสจับคู่ที่ขึ้นบน {host}",
            findTitle: "เจอในวง LAN นี้",
            findLooking: "กำลังหา GoXLR ในวง LAN…",
            findNone: "ไม่มีเครื่องสตรีมตอบกลับ เปิด GoXLR Link ที่เครื่องที่เสียบ GoXLR อยู่หรือยัง?",
            findAgain: "หาอีกครั้ง",
            findLink: "เชื่อม",
            findLinked: "เลือกแล้ว",
            pullHint: "ดึงจอยออกมาเพื่อแยกเป็นหน้าต่างเล็ก",
            linkSettings: "ตั้งค่า LINK",
            keySwitches: "กด {key} สลับ",
            controllerEmpty: "GoXLR อยู่อีกเครื่อง? เปิด GoXLR Link ที่เครื่องนี้เพื่อเสียบเสียงและแซมเปลอร์เข้ามา",
            intro: "ส่งเสียง GoXLR พร้อม effect สดๆ เข้าเกมในอีกเครื่อง",
            popOut: "แยกหน้าต่าง",
            dockBack: "เก็บกลับ",
            poppedOut: "GoXLR Link แยกออกไปแล้ว",
            poppedOutHint: "ยังทำงานอยู่ในหน้าต่างเล็กของมัน",
            popOutBlocked: "หน้าต่างนี้เปิดหน้าต่างแยกไม่ได้ ลองเปิดแอป GoXLR ในเบราว์เซอร์แทน",
            thisPcStream: "เครื่องนี้: เครื่องสตีม",
            thisPcGaming: "เครื่องนี้: เครื่องเล่นเกม",
            thisPcBoth: "เครื่องนี้: ทั้งสตีมและเกม (ทดสอบ)",
            sendingChatMic: "กำลังส่ง Chat Mic",
            fxOn: "เปิด {fx}",
            noGamingPc: "ยังไม่มีเครื่องเกมต่อ",
            pairingCodeIs: "รหัสจับคู่ {code} · ใส่ใน GoXLR Link ที่เครื่องเกม",
            connectedDetail: "เชื่อมแล้ว · {ms} ms · ไมค์ในเกม: {mic}",
            live: "สด",
            samplerFromGamingPc: "แซมเปลอร์จากเครื่องเกม",
            playsOnGoxlr: "ดังบน GoXLR",
            noSampleYet: "ยังไม่มีเสียงที่กดจากเครื่องเกม",
            lastSample: "ล่าสุด: “{name}” · {ago}",
            secondsAgo: "{n} วิที่แล้ว",
            minutesAgo: "{n} นาทีที่แล้ว",
            notRunningHere: "GoXLR Link ไม่ได้เปิดอยู่ในเครื่องนี้",
            howToStart: "เครื่องสตีม: รัน “goxlr-link.exe host” · เครื่องเกม: เปิด GoXLR Link",
            noAppThere: "อีกเครื่องไม่มีแอป GoXLR?",
            installLink: "ลงแอป GoXLR Link ตัวเล็กที่เครื่องนั้นแทน",
            getLink: "โหลด GoXLR Link",
            getLinkSoon: "มาพร้อมตัวติดตั้ง (ยังไม่พร้อม)",
            settings: "ตั้งค่า",
            notRunning: "GoXLR Link ไม่ได้เปิดอยู่ในเครื่องนี้",
            getVbCable: "โหลด VB-Cable",
            streamingPc: "เครื่องสตีม (IP)",
            pairingCode: "รหัสจับคู่",
            paired: "จับคู่แล้ว ใส่รหัสใหม่ถ้าจะเปลี่ยน",
            pairingHint: "ดูได้ที่เครื่องสตีมตอนเปิด GoXLR Link",
            backupMic: "ไมค์สำรอง",
            windowsDefault: "ไมค์หลักของ Windows",
            fallback: "สลับไปไมค์สำรองถ้าเครื่องสตีมหลุด",
            hotkey: "ปุ่มลัดสลับไมค์ในเกม",
            discordTitle: "ใน Discord และเกม ให้เลือกไมค์เป็น \"GoXLR Link Mic\"",
            discordTips: "Discord: ตั้ง Noise Suppression เป็น None และปิด Echo Cancellation กับ Automatic Gain Control ไม่งั้นเสียง effect กับ sampler จะโดนตัด",
            language: "ภาษา",
            gameMic: "ไมค์ในเกม",
            whatTeamHears: "เสียงที่เพื่อนได้ยิน",
            goxlrVoice: "เสียง GoXLR",
            thisPcMic: "ไมค์เครื่องนี้",
            fxOff: "ปิด FX อยู่",
            noEffects: "ไม่ได้เปิด effect",
            sending: "กำลังส่ง",
            hotkeyHint: "กด {key} สลับได้ แม้อยู่ในเกม",
            sampler: "แซมเปลอร์",
            samePads: "ปุ่มเดียวกับบน GoXLR",
            bank: "แบงก์แซมเปลอร์",
            emptyPad: "ว่าง",
            stop: "หยุด",
            samplerWaiting: "ปุ่มจะขึ้นเมื่อต่อเครื่องสตีมได้",
            offline: "○ ไม่ได้เปิด",
            notLinked: "○ ยังไม่เชื่อม",
            linkedTo: "● เชื่อมกับ {host} แล้ว",
            linked: "● เชื่อมแล้ว",
            linkedNoAudio: "● เชื่อมแล้ว · ยังไม่มีเสียง",
            goxlrLive: "เสียง GoXLR · สดจากเครื่องสตีม",
            backupThisPc: "{name} · เครื่องนี้",
            goxlrHint: "หมุนปุ่มบน GoXLR เพื่อนจะได้ยินตาม",
            fellBack: "เครื่องสตีมเงียบไป เพื่อนจะได้ยินไมค์นี้จนกว่าเครื่องสตีมจะกลับมา",
            plainVoice: "เสียงปกติ ไม่มี effect ของ GoXLR",
        },
        // For these, the keys map directly to their GoXLR Channel Names
        channels: {
            All: "ทั้งหมด",
            Mic: "ไมโครโฟน",
            Chat: "Voice Chat",
            Music: "เพลง",
            Game: "เกม",
            Console: "คอนโซล",
            LineIn: "Line In",
            System: "ระบบ",
            Sample: "แซมเปิล",
            LineOut: "Line Out",
            Headphones: "หูฟัง",
            MicMonitor: "มอนิเตอร์ไมค์",
            StreamMix: "Stream Mix",
            StreamMix1: "Stream Mix 1",
            StreamMix2: "Stream Mix 2",
            ChatMic: "Chat Mic",
            Sampler: "แซมเพลอร์",
            VOD: "VOD",
        },

        faders: {
            A: "แชนเนล 1",
            B: "แชนเนล 2",
            C: "แชนเนล 3",
            D: "แชนเนล 4"
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
            ok: "ตกลง",
            yes: "ใช่",
            no: "ไม่",
            cancel: "ยกเลิก",
            continue: "ดำเนินการต่อ",
            close: "ปิด",
        },

        common: {
            close: "ปิด",
            clear: "ล้าง",
            collapseSection: "ยุบส่วนนี้",
            expandSection: "ขยายส่วนนี้",
            activeProfile: "โปรไฟล์ที่ใช้งาน",
            switchDevice: "สลับอุปกรณ์",
            removeSample: "ลบแซมเปิล",
            waterfallAnimationUp: "แอนิเมชันน้ำตกขึ้น",
            waterfallAnimationDown: "แอนิเมชันน้ำตกลง",
            unknown: "ไม่ทราบ",
            tabList: "รายการแท็บ",
        },

        // These Strings appear in the tabs throughout the pages
        navigation: {
            screens: "จอ",
            // Tabs at the top of the Page
            menu: "เมนู",
            unsaved: "มีการเปลี่ยนแปลงที่ยังไม่ได้เซฟ: เปิดเมนูนี้แล้วกด Save ไม่งั้นถอดสาย GoXLR แล้วจะหาย",
            profiles: "โปรไฟล์",
            presets: "พรีเซ็ต",
            samples: "แซมเปิล",

            // Main Navigation Tabs
            microphone: "ไมค์",
            mixer: "มิกเซอร์",
            configuration: "ตั้งค่าปุ่ม",
            effects: "เอฟเฟกต์",
            sampler: "แซมเพลอร์",
            lighting: "ไฟ",
            lightingFaders: "ไฟเฟดเดอร์",
            routing: "เส้นทางเสียง",
            system: "ระบบ",

            // Navigation Sections on the Lighting Page
            lightingGlobal: "ทั้งเครื่อง",
            lightingMixer: "มิกเซอร์",
            lightingEffects: "เอฟเฟกต์",
            lightingSampler: "แซมเพลอร์",
            lightingCough: "ปุ่ม Cough",

            // Accessibility Messages (these are announced to screen readers)
            accessibilityProfileSection: "โปรไฟล์และไฟล์",
            accessibilityDeviceSection: "การตั้งค่าอุปกรณ์",
            accessibilityLightingSection: "การตั้งค่าไฟ",
        },

        // หน้า Screens (mockup docs/mockups/2026-10-30-screens)
        screens: {
            title: "จอ",
            hint: "แต่งจอทั้ง 4 บน GoXLR ได้เอง เลือกจอ แล้วให้โชว์ชื่อช่อง คำของคุณ หรือรูปหรือ GIF ที่เห็นตรงนี้คือที่จอจริงโชว์",
            mini: "GoXLR Mini ไม่มีจอ",
            pick: "เลือกจอ",
            screenN: "จอ {n}",
            faderN: "เฟดเดอร์ {n}",
            show: "โชว์บนจอนี้",
            modes: {
                name: "ชื่อช่อง", nameHint: "แบบเดิม",
                text: "คำของคุณ", textHint: "พิมพ์อะไรก็ได้",
                image: "รูปหรือ GIF", imageHint: "ภาพเคลื่อนไหวก็ได้",
            },
            nameNote: "โชว์ช่องที่อยู่บนเฟดเดอร์นี้กับไอคอน daemon วาดให้เหมือนเดิม เปลี่ยนช่องหรือไอคอนได้ที่หน้า <b>Configuration</b>",
            text: "ข้อความ",
            font: "ฟอนต์",
            fonts: { pixel: "พิกเซล (จุดคม)", title: "Rajdhani (แบบในแอป)", body: "Play" },
            size: "ขนาด",
            align: "จัดวาง",
            aligns: { left: "ซ้าย", center: "กลาง", right: "ขวา" },
            tooLong: "ถ้ายาวเกิน",
            longs: { shrink: "ย่อ", scroll: "วิ่ง" },
            lightBackground: "พื้นสว่าง ตัวหนังสือมืด",
            bold: "ตัวหนา",
            dropHere: "ลาก GIF, PNG หรือ JPG มาวางที่นี่",
            becomesDots: "แปลงเป็นจุด 128 × 64 ขาวดำ",
            chooseFile: "เลือกไฟล์",
            noFile: "ยังไม่มีรูป เลือกไฟล์เพื่อดูตรงนี้",
            savedPicture: "รูปที่บันทึกไว้: {name} เลือกไฟล์ใหม่เพื่อเปลี่ยน",
            cantRead: "อ่าน {file} ไม่ได้ ลองใช้ GIF, PNG หรือ JPG",
            tooLongKeeping: "ยาวเกิน: เก็บช่วง {from}–{to} วินาที",
            merged: "รวมภาพที่เร็วเกิน {n} ภาพ",
            whichPart: "เก็บช่วง 10 วินาทีไหน",
            fit: "ขนาด",
            fits: { fit: "ทั้งรูป", fill: "เต็มจอ" },
            shading: "เงา",
            sharp: "คม",
            dotted: "จุดเกลี่ย (dither)",
            cutoff: "จุดตัดความสว่าง",
            speed: "ความเร็ว",
            swap: "สลับจุดติดกับจุดดับ",
            still: "รูปนิ่ง",
            loopInfo: "{n} ภาพ รอบละ {s} วินาที จอจริงรับได้สูงสุด 20 ภาพต่อวินาที",
            colour: "สีจอ",
            colourAll: "ทั้ง 4 จอ",
            colourOne: "เฉพาะจอนี้",
            colourAllLabel: "ทุกจอ",
            colourHint: "เปลี่ยนทันที กดบันทึกโปรไฟล์เพื่อเก็บไว้",
            tooDark: "สีไฟนี้มืดมาก จอจริงจะดูดำ ไม่ว่าจะโชว์อะไร",
            makeBright: "ใช้สีฟ้าสว่าง",
            thisScreen: "จอนี้",
            closeUp: "ขยาย",
            backToName: "กลับเป็นชื่อ",
            nameAgain: "จอนี้จะกลับมาโชว์ชื่อช่อง (หลังกดบันทึก)",
            save: "บันทึกลง GoXLR",
            saving: "กำลังบันทึก…",
            saved: "บันทึกแล้ว GoXLR โชว์จอพวกนี้แล้ว",
            saveFailed: "บันทึกไม่ได้: {reason}",
            lineUp: "จัดจอให้ตรง",
            lineUpSub: "ให้รูปเรียงต่อกันตรงทุกจอ",
            gap: "ช่องว่างระหว่างจอ",
            dots: "{n} จุด",
            testLine: "โชว์เส้นทดสอบบนจอจริง",
            lineUpNote: "วัดจาก GoXLR: จอกว้าง 18 × 12 mm ห่างกัน 7 mm ช่องว่างจึงเป็น <b>50 จุด</b> เปิดเส้นทดสอบแล้วเลื่อนจนเส้นดูตรงผ่านทั้ง 4 จอ",
        },

        // Device view: ตัวเครื่องลอยอยู่บนเดสก์ท็อป (mockup docs/mockups/2026-10-29-device-view)
        deviceView: {
            openApp: "เปิดแอป",
            minimise: "ย่อ",
            maximise: "ขยายเต็มจอ",
            close: "ปิดลง tray",
            wheelPick: "เลือกว่าล้อเมาส์ปรับอะไร",
            wheelChanges: "ล้อเมาส์ปรับ",
            keepTurning: "หมุนต่ออีกนิดเพื่อปรับ",
            button: "ดูแค่ตัวเครื่อง",
            buttonTitle: "แสดงแค่ตัวเครื่อง ลอยอยู่บนเดสก์ท็อป",
            startIn: "เปิดแอปมาเห็นแค่ตัวเครื่อง",
            startInHint: "เปิดแอปมาเห็นแค่ตัวเครื่อง คลิกส่วนไหน หรือกดเปิดแอป เพื่อดูทั้งหมด",
        },

        // Strings for the Device page (realistic GoXLR you can drag and click)
        device: {
            rightClickSettings: "คลิกขวาเพื่อตั้งค่า",
            bleepHint: "กด Bleep ค้างบนเครื่อง GoXLR คลิกขวาเพื่อตั้งค่า",
            tab: "เครื่อง",
            title: "GoXLR ของคุณ",
            hint: "ลากเฟดเดอร์และปุ่มหมุนบนรูปได้เลย เครื่องจริงจะขยับตาม จะตั้งค่าให้คลิกที่จอหรือชื่อ หรือคลิกขวา คลิกนอกตัวเครื่องเพื่อปิดการตั้งค่า",
            settings: "ตั้งค่า",
            closeSettings: "ปิดการตั้งค่า",
            editScreen: "เปลี่ยนจอนี้",
            textColour: "สีตัวอักษร",
            textDark: "สีเข้ม",
            textLight: "สีสว่าง",
            openIcons: "เปิดโฟลเดอร์ไอคอน (ใส่รูปของคุณเองได้ที่นี่)",
            menu: {
                changeChannel: "เปลี่ยนแชนเนล",
                muteButton: "ปุ่ม Mute ทำอะไร",
                mute: "ปิดเสียง",
                unmute: "เปิดเสียง",
                fullVolume: "ตั้งเสียงเป็น 100%",
                changeStyle: "เปลี่ยนสไตล์",
                resetCentre: "รีเซ็ตกลับกึ่งกลาง",
                resetZero: "รีเซ็ตเป็น 0",
                clickScreen: "คลิกจอ",
                clickName: "คลิกชื่อ",
                doubleClick: "ดับเบิลคลิก",
            },
            knobHint: "ลากซ้าย / ขวา · ดับเบิลคลิกเพื่อรีเซ็ต",
            muteChannel: "ปิดเสียง {channel}",
            volume: "ระดับเสียง",
            channel: "แชนเนลบนเฟดเดอร์นี้",
            muteButton: "ปุ่ม Mute ทำอะไร",
            style: "สไตล์",
            amount: "ปริมาณ",
            reset: "รีเซ็ต",
            effectOn: "เปิดเอฟเฟกต์",
            presetHelp: "กดปุ่มพรีเซ็ตเพื่อโหลดชุดเอฟเฟกต์ทั้งหมด ได้แก่ ปุ่มหมุนทั้งสี่ Megaphone, Robot และ Hard Tune",
            samplesOnPad: "แซมเปิลในแพดนี้",
            dropSamples: "ลากไฟล์เสียงมาวางตรงนี้ เพิ่มหลายไฟล์พร้อมกันได้",
            addSamples: "เพิ่มไฟล์เสียง",
            removeSample: "ลบ {name} ออกจากแพดนี้",
            sampleSizeLimit: "ไม่เกิน 128 MB ต่อไฟล์",
            sampleFormatsOnly: "ใช้ไฟล์ WAV, MP3, OGG หรือ FLAC",
            importingSamples: "กำลังเพิ่มไฟล์ {current} จาก {total}…",
            samplesImported: "เพิ่มไฟล์เสียงแล้ว {count} ไฟล์",
            sampleUploadFailed: "อัปโหลดไฟล์เสียงนี้ไม่สำเร็จ",
            sampleImportTimeout: "ประมวลผลเสียงนานเกินไป",
            sampleDeviceDisconnected: "GoXLR ขาดการเชื่อมต่อ",
            noSample: "ยังไม่มีแซมเปิลในแพดนี้",
            clearHelp: "กด Clear ค้างไว้ แล้วกดแพดเพื่อลบแซมเปิลออก",
            muteMic: "ปิดไมค์ตอนนี้",
            unmuteMic: "เปิดไมค์",
            bleepVolume: "ระดับเสียง Bleep",
            moreIn: "ตั้งค่าเพิ่มเติมได้ที่แท็บ {tab}",
            notOnFader: "ไม่ได้อยู่บนเฟดเดอร์",
            notOnFaderHint: "ทุกแชนเนลและเอาต์พุตยังกดถึงได้ในคลิกเดียว",
            input: "อินพุต",
            output: "เอาต์พุต",
            putOnFader: "ใส่บนเฟดเดอร์ของเครื่อง",
            sendTo: "ส่งเสียงไปที่",
            hearHere: "เสียงที่ได้ยินในช่องนี้",
            advanced: "ขั้นสูง",
            lightStyle: "รูปแบบไฟเฟดเดอร์",
            mixB: "ระดับ Mix B",
            faderStyles: {
                TwoColour: "สองสี",
                Gradient: "ไล่สี",
                Meter: "มิเตอร์",
                GradientMeter: "ไล่สี + มิเตอร์",
            },
            simple: "แบบง่าย",
            micHint: "เริ่มต้นแบบง่าย กด ⋮ บนการ์ดเพื่อเปิดค่าขั้นสูง",
            showAllAdvanced: "เปิดขั้นสูงทั้งหมด",
            effectsHint: "เลือกพรีเซ็ตแล้วหมุนปุ่มทั้งสี่ เปิด ปรับละเอียด บนการ์ดไหนก็ได้เพื่อตั้งค่าทุกรายละเอียด",
            fxHint: "เปิดหรือปิดเอฟเฟกต์ทั้งหมด",
            allControls: "ตัวควบคุมทั้งหมด",
            inputLevel: "ระดับเสียงเข้า",
            showMeter: "แสดงระดับเสียง",
            stopMeter: "หยุด",
            meterHint: "กดแสดงระดับเสียงแล้วพูดตามปกติ พยายามอย่าให้ถึงช่วงสีแดง",
            gateHint: "ตัดเสียงรบกวนในห้องตอนที่คุณไม่ได้พูด",
            eqHint: "ปรับโทนเสียงพูดของคุณ",
            compressorHint: "เกลี่ยเสียงดังและเสียงเบาให้สม่ำเสมอ",
            extrasHint: "De-esser และเสียง Bleep",
            backToSimple: "กลับไปแบบง่าย",
            moreControls: "อีก {n} ตัวปรับ",
            bandsLikeOriginal: "{n} แบนด์ แบบต้นฉบับ",
            strength: "ความแรง",
            levelQuiet: "เบา",
            aimZone: "ตอนพูดให้อยู่ในช่วงเส้นประ",
            changeMicSetup: "เปลี่ยนการตั้งค่าไมค์",
            liveInput: "เสียงไมค์สด",
            levelGood: "ระดับพอดี",
            levelLoud: "ดังเกินไป",
            levelLow: "เบาไปหน่อย",
            levelSilent: "เงียบ",
            aimHere: "ตอนพูดให้อยู่ช่วงนี้",
            gateLine: "Gate เปิดเมื่อเสียงสูงกว่าเส้นนี้ (ลากได้)",
            gateGraph: "Gate เปิด / ปิด",
            compGraph: "เข้า → ออก",
            showBands: "แสดง {n} แบนด์",
            nBands: "{n} แบนด์",
            fineTuneFreqs: "ปรับความถี่ละเอียด",
            resetFlat: "รีเซ็ตเป็นเส้นตรง",
            spectrumLive: "สด · {name}",
            spectrumDenied: "ไม่ได้รับสิทธิ์ใช้ไมค์",
            spectrumNoInput: "ไม่มีเสียงเข้าให้กราฟ",
            spectrumFill: "กราฟเสียง: แบบทึบ",
            spectrumBars: "กราฟเสียง: แบบแท่ง",
            spectrumOff: "กราฟเสียง: ปิด",
            peakHold: "ค้างจุดสูงสุด",
            spectrumInput: "ฟังจาก {name}",
            showAdvancedN: "แสดงขั้นสูง ({n})",
            cardOptions: "ตัวเลือก {name}",
            lower: "ลด",
            raise: "เพิ่ม",
            eqDrag: "ลากจุดขึ้นหรือลง หรือคลิกจุดแล้วกด − / + หรือปุ่มลูกศร",
            eqDragFine: "ลากขึ้นลงเพื่อปรับระดับ ลากซ้ายขวาเพื่อเลื่อนความถี่",
            eqRanges: {
                subBass: "Sub bass",
                bass: "Bass",
                lowMids: "Low mids",
                midRange: "Mid range",
                upperMids: "Upper mids",
                highs: "Highs",
            },
            denoise: "ลดเสียงรบกวน",
            denoiseHint: "AI ลบเสียงรบกวน เฉพาะเสียงไมค์",
            denoiseUnavailable: "daemon ตัวนี้ยังไม่มี Denoise เส้นทางเสียงเดิมไม่ถูกเปลี่ยน",
            denoiseChecking: "กำลังตรวจช่องเสียง… เปิดตั้งค่าเพื่อโหลดรายการใหม่",
            denoiseTimeout: "Denoise เริ่มไม่ทันเวลา จึงยังปิดอยู่",
            denoiseStillOn: "ปิด Denoise ไม่สำเร็จ จึงยังไม่บันทึกการตั้งค่า",
            denoiseSetupRequired: "ต้องตั้งค่าก่อน",
            denoiseChooseSend: "เลือกช่องส่งออกก่อน",
            denoiseChooseReturn: "เลือกทางส่งเสียงกลับเข้าหูฟังก่อน",
            denoiseStarting: "กำลังเริ่ม…",
            denoiseWorking: "กำลังทำงาน…",
            denoiseFailed: "เปลี่ยน Denoise ไม่สำเร็จ ลองใหม่อีกครั้ง",
            denoiseMegaphoneBypass: "พักการกรองเพื่อรักษาเสียง Megaphone/Radio",
            denoiseSetup: "ตั้งค่า",
            denoiseSendOutput: "ส่งไปที่",
            denoiseSendOutputHint: "ในแอป ให้เลือกช่องรับที่คู่กันเป็นไมค์ Chat Mic และ Stream Mix เดิมจะไม่ถูกกรอง",
            denoiseMonitorReturn: "ทางส่งกลับเข้าหูฟัง",
            denoiseMonitorReturnHint: "ช่องนี้ของ GoXLR จะใช้กับเสียงที่สะอาดอย่างเดียวขณะเปิด Monitor",
            denoiseNotSet: "ยังไม่เลือก",
            denoiseSave: "บันทึกการตั้งค่า",
            denoiseRefresh: "โหลดรายการใหม่",
            comingSoon: "เร็วๆ นี้",
            denoiseSend: "ส่งออก",
            denoiseSendHint: "ส่งเสียงที่สะอาดไปยังช่องที่เลือก",
            denoiseMonitor: "เสียงไมค์ในหูฟัง",
            denoiseMonitorHint: "ฟังเสียงที่สะอาดในหูฟัง",
            denoiseNote: "ทั้งสองปิดไว้จนกว่า Denoise จะพร้อม เส้นทางเสียงเดิมไม่ถูกเปลี่ยน",
            fineControls: "ปรับละเอียด",
            nMore: "อีก {n}",
            voiceEffects: "เอฟเฟกต์เสียง",
            on: "เปิด",
            off: "ปิด",
            mixerHint: "ลากเฟดเดอร์เพื่อปรับระดับเสียง ไอคอนใต้ช่องที่ติดไฟ = ส่งเสียงไปที่นั่น",
            chatMicBlocked: "แชทเสียงส่งไปไมค์แชทไม่ได้",
            levelByChannels: "ระดับตามช่องเสียง",
            listenInHeadphones: "ฟังมิกซ์นี้ในหูฟัง",
            hardwareFaderLegend: "ขอบสีฟ้า = อยู่บนเฟดเดอร์เครื่องจริง (มีปุ่มปิดเสียง)",
            mixBToggle: "Mix B (ซับมิกซ์)",
            level: "ระดับเสียง",
            mixALevel: "ระดับ Mix A",
            mixBLevel: "ระดับ Mix B",
            mute: "ปิดเสียง",
            muteNeedsFader: "ปุ่มปิดเสียงมีเฉพาะแชนเนลที่อยู่บนเฟดเดอร์ ถ้าจะปิดเสียงแชนเนลนี้ ให้เอาจุดเส้นทางเสียงออก",
            routingFootnote: "จุดเต็ม = ส่งเสียงไปที่นั่น Voice Chat ส่งไป Chat Mic ไม่ได้ จุดนั้นจึงเป็นสีจาง แชนเนลที่ไม่ได้อยู่บนเฟดเดอร์ไม่มีปุ่มปิดเสียง ให้เอาจุดออกแทน",
            samplerHint: "เลือกแบงก์ กดที่ pad แล้วตั้งค่าว่าจะให้เล่นอะไร",
            padTitle: "pad {pad}",
            bankN: "แบงก์ {bank}",
            whenPressed: "เมื่อกด",
            samplesOnPad: "เสียงใน pad นี้",
            sampleCount: "{n} เสียง | {n} เสียง",
            emptyPad: "ว่าง",
            noSamplesYet: "ยังไม่มีเสียง เพิ่มเสียง หรืออัดเสียงโดยกดค้างที่ pad บน GoXLR",
            trimHint: "ลากที่จับเพื่อตัดต้น/ท้าย",
            playSample: "เล่น {name}",
            removeSample: "ลบ {name}",
            pickSample: "เลือกเสียงด้านบนเพื่อดูรูปคลื่นเสียง",
            clipRed: "สีแดง",
            clipLegend: "= ดังเกิน เสียงจะแตก",
            peak: "พีค",
            average: "เฉลี่ย",
            levelVerdict: {
                good: "ระดับพอดี",
                close: "ใกล้แตกแล้ว",
                clipping: "เสียงแตก ลด Gain ลง",
                quiet: "เบาไป",
            },
            gainPerFile: "ใช้กับไฟล์นี้ทุกที่ที่ใส่ไว้",
            duplicate: "ซ้ำ",
            duplicateHint: "ไฟล์นี้อยู่ใน pad นี้มากกว่า 1 ครั้ง และใช้ Gain ค่าเดียวกัน",
            configHint: "เลือกว่าเฟดเดอร์แต่ละตัวคุมช่องไหน และปุ่ม mute ปิดเสียงไปที่ไหน กดค้างที่ปุ่ม mute จะปิดเสียงทั้งหมดเสมอ",
            muteTo: "ปิดเสียงไปที่",
            muteAll: "ทั้งหมด",
            micMuteButton: "ปุ่มปิดไมค์",
            mutesMicTo: "ปิดไมค์ไปที่",
            kinds: {
                channel: "แชนเนล",
                fader: "เฟดเดอร์ {n}",
                knob: "ปุ่มหมุนเอฟเฟกต์",
                fx: "ปุ่มเอฟเฟกต์",
                preset: "พรีเซ็ตเอฟเฟกต์",
                pad: "แพดแซมเปิล",
                clear: "แซมเพลอร์",
                cough: "ปุ่มปิดไมค์",
            },
        },

        // Strings that appear in the Mic tab, note that the Profile Strings are handled in 'profileManager'
        microphone: {
            profiles: {
                title: "โปรไฟล์ไมค์"
            },

            setup: {
                button: "ตั้งค่าไมค์",
                title: "ตั้งค่าไมค์",
                type: "ประเภทไมค์",
                gain: "Gain",

                // Microphone Types
                xlr: "ไมค์ XLR",
                phantom: "XLR + Phantom (+{voltage}V)",
                jack: "3.5mm",
            },

            waveform: {
                loud: "ดังเกินไป",
                good: "กำลังดี",
                gate_estimated: "ค่า Gate เป็นค่าประมาณ"
            },

            gate: {
                title: "Gate",
                threshold: "Threshold",
                attenuation: "Attenuation",
                attack: "Attack",
                release: "Release",
            },

            equaliser: {
                title: "อีควอไลเซอร์",
                reset: "รีเซ็ต",
                enableFineTune: "ปรับละเอียด",
                bass: "เสียงทุ้ม",
                mid: "เสียงกลาง",
                treble: "เสียงแหลม",
            },

            compressor: {
                title: "คอมเพรสเซอร์",
                amount: "ปริมาณ",
                threshold: "Threshold",
                ratio: "Ratio",
                attack: "Attack",
                release: "Release",
                makeUpGain: "Make-Up Gain",
            },

            extras: {
                title: "เพิ่มเติม",
                deEsser: "De-Esser",
                bleep: "Bleep",
            }
        },

        mixer: {
            // Box Headers
            inputs: "อินพุต",
            outputs: "เอาต์พุต",
            onYourGoxlr: "บนเครื่อง GoXLR",
            otherChannels: "ช่องอื่น ๆ",
            output: "เอาต์พุต",
            appOutput: "เอาต์พุต วางแอปไม่ได้",
            appMove: "ย้าย {app}",
            appPlaying: "กำลังมีเสียง",
            appDrop: "ลากแอปมาวางที่นี่",
            appMoveTo: "ย้ายไป {channel}",
            appWindowsDefault: "กลับไปใช้ค่าเริ่มต้นของ Windows",
            appMoved: "{app} ออกเสียงทาง {channel} แล้ว ถ้ายังไม่ได้ยินในช่องนี้ ให้ปิดเปิด {app} ใหม่",
            appMovedDefault: "{app} กลับไปใช้ช่องเสียงเริ่มต้นของ Windows แล้ว",
            appMoveFailed: "ย้าย {app} ไม่ได้: {reason}",
            appYourMic: "ไมค์ของคุณ",
            appFromCable: "มาจากสายเสียบ",
            appsElsewhere: "แอปที่ไม่ได้อยู่บน GoXLR",
            // หน้า Mixer ใหม่ (mockup docs/mockups/2026-10-29-mixer)
            pageHint: "หนึ่งการ์ดต่อหนึ่งเสียง ตั้งความดัง ปิดเสียง ลากแอปมาใส่ และเลือกว่าเสียงไปไหน ถ้าเปิด Mix B แต่ละเสียงจะมีความดังชุดที่สอง ให้สตรีมได้ยินคนละแบบกับคุณ",
            mixBSameSwitch: "สวิตช์เดียวกับหน้า Routing",
            oneMix: "มิกซ์เดียว",
            oneMixHint: "ทุกเอาต์พุตได้ยินความดังเท่ากัน เปิด Mix B เพื่อให้สตรีม (หรือเอาต์พุตอื่น) มีความดังของตัวเอง",
            mixATitle: "Mix A · ความดังของเฟดเดอร์",
            mixBTitle: "Mix B · ความดังชุดที่สอง",
            playsIn: "เล่นใน: {outputs}",
            nothing: "ไม่มี",
            nothingYet: "ยังไม่มี เลือก B ที่เอาต์พุตด้านล่าง",
            sounds: "เสียง",
            soundsHelp: "เฟดเดอร์ 1 ถึง 4 บน GoXLR มาก่อน เลื่อนความดัง A แล้วเฟดเดอร์จริงขยับตาม",
            soundsSub: "ลากความดัง ลากแอปข้ามการ์ดได้",
            showWhere: "แสดงว่าเสียงไปไหน",
            faderN: "เฟดเดอร์ {n}",
            noFader: "ไม่มีเฟดเดอร์",
            volume: "ความดัง",
            noMeter: "เสียงนี้ไม่มีมิเตอร์",
            bFollowsA: "B ตาม A",
            bOnItsOwn: "B แยกเอง",
            linkTitle: "เปิดไว้ B จะขยับตาม A และห่างเท่าเดิม",
            mute: "ปิดเสียง",
            muted: "ปิดอยู่",
            muteOnlyFader: "GoXLR ปิดเสียงได้เฉพาะเสียงที่อยู่บนเฟดเดอร์",
            needsFader: "ต้องอยู่บนเฟดเดอร์",
            muteHow: {
                All: "ปิดทุกที่",
                ToStream: "ปิดเฉพาะสตรีม",
                ToVoiceChat: "ปิดเฉพาะ Chat Mic",
                ToPhones: "ปิดเฉพาะหูฟัง",
                ToLineOut: "ปิดเฉพาะ Line Out",
                ToStream2: "ปิดเฉพาะสตรีม 2",
                ToStreams: "ปิดทั้งสองสตรีม",
            },
            lampOnTitle: "กดปิดถ้าไม่ได้ใช้เสียงนี้",
            lampOffTitle: "ไม่ได้ใช้ กดเพื่อเปิดกลับ",
            inUse: "ใช้อยู่",
            markedNotInUse: "ตั้งว่าไม่ได้ใช้",
            notInUse: "ไม่ได้ใช้",
            stillToStream: "ยังส่งไปสตรีม",
            lampOffDone: "{sound} เป็นสีเทาแล้ว เสียงยังออกตามที่ตั้งไว้ใน \"ไปที่\"",
            lampOnDone: "{sound} กลับมาใช้แล้ว",
            apps: "แอป",
            appsClosedMic: "ไมค์ของคุณ ใส่แอปไม่ได้",
            appsClosedJack: "ช่องเสียบบน GoXLR ใส่แอปไม่ได้",
            goesTo: "ไปที่",
            nobodyHears: "ไม่มีใครได้ยินเสียงนี้",
            chatLocked: "ส่ง Chat ไป Chat Mic ไม่ได้ คนในสายจะได้ยินเสียงตัวเอง",
            chatLockedTitle: "ล็อก: คนในสายจะได้ยินเสียงตัวเอง",
            outputsSub: "ที่ที่เสียงออก และแต่ละที่เล่นมิกซ์ไหน",
            noOwnVolume: "ไม่มีความดังของตัวเอง",
            setBySounds: "ตั้งจากการ์ดเสียงด้านบน",
            playsMix: "เล่นมิกซ์",
            listen: "ฟัง",
            listening: "กำลังฟัง",
            listenTitle: "เล่นเอาต์พุตนี้ในหูฟังของคุณ",
            listenNow: "หูฟังของคุณเล่น {output} อยู่ จะได้ยินแบบเดียวกับที่นั่น",
            listenBack: "หูฟังกลับมาเล่นมิกซ์หูฟังแล้ว",
            hears: "ได้ยิน: {sounds}",
            micMonitorWho: "ความดังของเสียงไมค์ตัวเองในหูฟัง",
            appsElsewhereSub: "เล่นผ่านอุปกรณ์เสียงอื่น ลากไปวางบนการ์ดเสียงด้านบนเพื่อย้าย",
            appsElsewhereEmpty: "ลากแอปมาที่นี่เพื่อส่งกลับไปอุปกรณ์เดิม",
            soundName: {
                Mic: "ไมค์", Chat: "แชต", Music: "เพลง", Game: "เกม", Console: "คอนโซล",
                LineIn: "Line In", System: "ระบบ", Sample: "แซมเปิล",
            },
            soundWhat: {
                Mic: "เสียงของคุณ", Chat: "คุยสาย", Music: "แอปเพลง", Game: "เกมของคุณ",
                Console: "ช่องเสียบคอนโซล", LineIn: "ช่องเสียบ Line In", System: "เสียง Windows", Sample: "แพดแซมเปิล",
            },
            outputName: {
                Headphones: "หูฟัง", LineOut: "Line Out", MicMonitor: "Mic Monitor", BroadcastMix: "สตรีม",
                StreamMix2: "สตรีม 2", ChatMic: "Chat Mic", Sampler: "Sampler",
            },
            outputShort: {
                Headphones: "หูฟัง", BroadcastMix: "สตรีม", StreamMix2: "สตรีม 2", LineOut: "Line Out",
                ChatMic: "Chat Mic", Sampler: "Sampler",
            },
            outputWhat: {
                Headphones: "ที่คุณได้ยิน", LineOut: "ลำโพงหรือเครื่องที่ 2", MicMonitor: "เสียงไมค์ในหูฟัง",
                BroadcastMix: "คนดูและการอัด", StreamMix2: "มิกซ์สตรีมชุดที่สอง",
                ChatMic: "ที่คนในสายได้ยิน", Sampler: "ที่แพดอัด",
            },
            mixAssignment: "กำหนดมิกซ์",

            // Submix Checkbox
            submix: "ซับมิกซ์",

            // Mix Assignment
            channelA: "A",
            channelB: "B"
        },

        // Strings in the Configuration Tab
        configuration: {
            // This is common between Faders and Cough Buttons
            mute_behaviour: {
                base: "ปิดเสียงไปยัง {channel}",
                all: "ปิดเสียงทั้งหมด",

                stream: "ปิดเสียงไปยัง @:message.channels.StreamMix",
                stream1: "ปิดเสียงไปยัง @:message.channels.StreamMix1",
                stream2: "ปิดเสียงไปยัง @:message.channels.StreamMix2",
                streams: "ปิดเสียงไปยัง @:message.channels.StreamMix 1 + 2",
                chatMic: "ปิดเสียงไปยัง @:message.channels.ChatMic",
                headphones: "ปิดเสียงไปยัง @:message.channels.Headphones",
                lineOut: "ปิดเสียงไปยัง @:message.channels.LineOut",
            },
            muteBehaviourTitle: "การปิดเสียง",
            muteBehaviourLabel: "การปิดเสียงของ {channel}",

            // Config for the Faders
            faders: {
                title: "เฟดเดอร์",
                channelTitle: "แชนเนล",
                sourceTitle: "แหล่งเสียง",
                sourceLabel: "แหล่งเสียงของ {channel}",
            },

            // Configuration for the Cough Button
            cough: {
                behaviour: {
                    hold: "กดค้าง",
                    toggle: "กดสลับ",
                },

                title: "ตั้งค่าปุ่ม Cough",
                behaviourTitle: "การทำงานของปุ่ม",
            }
        },

        effects: {
            preset: {
                title: "พรีเซ็ต",
                group: "กลุ่ม",

                menuLoad: "โหลด",
                menuRename: "เปลี่ยนชื่อ",
                menuSave: "บันทึกลงคลัง",


                loadPreset: "โหลดพรีเซ็ต",

                renamePresetTitle: "เปลี่ยนชื่อพรีเซ็ต",
                renamePresetPlaceholder: "ชื่อพรีเซ็ตใหม่",
                renamePresetOk: "@:message.modalButtons.ok",
                renamePresetCancel: "@:message.modalButtons.cancel",

                noPresets: "ยังไม่มีพรีเซ็ตในคลัง บันทึกหรือคัดลอกพรีเซ็ตมาไว้ก่อนแล้วจะแสดงที่นี่",
                loadPresetOk: "@:message.modalButtons.ok",

                confirmTitle: "ยืนยันการโหลดพรีเซ็ต",
                confirmMessage: "การโหลดพรีเซ็ตนี้จะแทนที่การแก้ไขที่ยังไม่ได้บันทึกในแบงก์เอฟเฟกต์นี้ ต้องการดำเนินการต่อหรือไม่?",
                confirmOk: "@:message.modalButtons.ok",
                confirmCancel: "@:message.modalButtons.cancel",

                overwriteTitle: "ยืนยันการเขียนทับพรีเซ็ต",
                overwriteMessage: "มีพรีเซ็ต {current} อยู่ในคลังแล้ว ต้องการเขียนทับหรือไม่?",
                overwriteConfirm: "เขียนทับ",
                overwriteCancel: "@:message.modalButtons.cancel",

                accessibilityOpenPresetDirectory: "เปิดโฟลเดอร์พรีเซ็ต",
                accessibilityPresetLoaded: "โหลดพรีเซ็ต {name} ไปยัง {bank} แล้ว",
                accessibilityPresetSaved: "บันทึกพรีเซ็ต {name} ลงคลังแล้ว",
            },
            reverb: {
                title: "Reverb",
                style: "สไตล์",

                styles: {
                    library: "Library",
                    darkBloom: "Dark Bloom",
                    musicClub: "Music Club",
                    realPlate: "Real Plate",
                    chapel: "Chapel",
                    hockeyArena: "Hockey Arena"
                },

                amount: "ปริมาณ",
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

                style: "สไตล์",
                styles: {
                    quarter: "Quarter",
                    eighth: "Eighth",
                    triplet: "Triplet",
                    pingPong: "Ping Pong",
                    classicSlap: "Classic Slap",
                    multiTap: "MultiTap"
                },

                amount: "ปริมาณ",
                feedback: "Feedback",
                tempo: "Tempo",
                delayLeft: "Delay L",
                delayRight: "Delay R",
                feedbackLeft: "Feedback L",
                feedbackRight: "Feedback R",
                xfbLeftToRight: "XFB L ไป R",
                xfbRightToLeft: "XFB R ไป L",
            },

            pitch: {
                title: "Pitch",

                style: "สไตล์",
                styles: {
                    narrow: "Narrow",
                    wide: "Wide"
                },

                amount: "ปริมาณ",
                character: "Character"
            },

            gender: {
                title: "Gender",

                style: "สไตล์",
                styles: {
                    narrow: "Narrow",
                    medium: "Medium",
                    wide: "Wide"
                },

                amount: "ปริมาณ"
            },

            megaphone: {
                title: "Megaphone",

                style: "สไตล์",
                styles: {
                    megaphone: "Megaphone",
                    radio: "Radio",
                    onThePhone: "On The Phone",
                    overdrive: "Overdrive",
                    buzzCutt: "Buzz Cutt",
                    tweed: "Tweed"
                },

                amount: "ปริมาณ",
                postGain: "Post Gain"
            },

            robot: {
                title: "Robot",

                style: "สไตล์",
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

                style: "สไตล์",
                styles: {
                    natural: "Natural",
                    medium: "Medium",
                    hard: "Hard"
                },

                amount: "ปริมาณ",
                rate: "Rate",
                window: "Window",

                source: "แหล่งเสียง"
            }
        },

        sampler: {
            bankTitle: "แบงก์",
            banks: {
                bankTitle: "แบงก์",
                bank: {
                    a: "A",
                    b: "B",
                    c: "C"
                },
                buttonTitle: "ปุ่ม",
                buttonLabel: "ปุ่มของแบงก์ {activeBank}",
                buttons: {
                    topLeft: "บนซ้าย",
                    topRight: "บนขวา",
                    bottomLeft: "ล่างซ้าย",
                    bottomRight: "ล่างขวา",
                },

                functionTitle: "การทำงาน",
                functionLabel: "การทำงานของปุ่ม{activeButton} ในแบงก์ {activeBank}",
                functions: {
                    playNext: "เล่น / ถัดไป",
                    playStop: "เล่น / หยุด",
                    playFade: "เล่น / ค่อยๆ เบาลง",
                    stopOnRelease: "หยุดเมื่อปล่อยปุ่ม",
                    fadeOnRelease: "ค่อยๆ เบาลงเมื่อปล่อยปุ่ม",
                    loop: "วนซ้ำ"
                },

                playOrderTitle: "ลำดับการเล่น",
                playOrderLabel: "ลำดับการเล่นของปุ่ม{activeButton} ในแบงก์ {activeBank}",
                playOrders: {
                    sequential: "ตามลำดับ",
                    random: "สุ่ม",
                },
            },

            samplesTitle: "แซมเปิล",
            dropToAdd: "วางเพื่อเพิ่มลง {pad}",
            orDropFiles: "หรือลากไฟล์เสียงมาวางที่นี่",
            samples: {
                samplesTitle: "แซมเปิล",
                samplesLabel: "แซมเปิลของปุ่ม{activeButton} ในแบงก์ {activeBank}",

                // Button at the bottom of the Sample List
                addSample: "+",
                addSampleLabel: "เพิ่มแซมเปิล",
                sampleSelector: {
                    parentDirectory: "โฟลเดอร์ก่อนหน้า",
                    addButton: "เพิ่ม",

                    noSamples: "ยังไม่มีแซมเปิลในโฟลเดอร์แซมเปิล คัดลอกไฟล์เสียงมาไว้ก่อนแล้วจะเลือกได้ที่นี่!",

                    // Used with Screen Readers
                    directories: "โฟลเดอร์",
                    samples: "แซมเปิล",
                },

                gain: "Gain",
                waveform: {
                    title: "รูปคลื่นเสียง",

                    // These are primarily for accessibility, but are labels on the various buttons.
                    text: "รูปคลื่นเสียงของ {sample}",

                    // The Play / Stop button before the waveform
                    playbackSample: "เล่นแซมเปิล",
                    stopSample: "หยุดแซมเปิล",

                    // Labels for the draggable 'Handles'
                    sampleStart: "จุดเริ่มแซมเปิล",
                    sampleEnd: "จุดจบแซมเปิล",

                    sampleDeleted: "ลบแซมเปิล {sampleName} ออกจากปุ่ม{activeButton} ในแบงก์ {activeBank} แล้ว",
                    zoomLevel: "ระดับซูม: {level}",
                },

                addSampleWaitTitle: "กรุณารอสักครู่",
                addSampleAnalysing: "กรุณารอสักครู่ กำลังวิเคราะห์แซมเปิล",
                addSampleProgress: "ความคืบหน้า: {progress}@:message.suffixes.percentage",

                errorTitle: "เพิ่มแซมเปิลไม่สำเร็จ",
                errorText: "เกิดข้อผิดพลาดขณะเพิ่มแซมเปิลลงในแบงก์:",
                genericError: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",

                accessibilityOpenSamplesDirectory: "เปิดโฟลเดอร์แซมเปิล",
                accessibilityAnalysing: "กรุณารอสักครู่ กำลังวิเคราะห์แซมเปิล อาจใช้เวลาสองสามนาที",
                accessibilityAdded: "เพิ่มแซมเปิล {name} ไปยังปุ่ม{activeButton} ในแบงก์ {activeBank} แล้ว"
            }
        },

        lighting: {
            undo: "ย้อนกลับ",
            undoHint: "ย้อนสีที่เพิ่งเปลี่ยน (Ctrl+Z)",
            faderLights: {
                title: "ไฟเฟดเดอร์",
                lede: "ไฟ LED ข้างเฟดเดอร์แต่ละตัวบนเครื่อง GoXLR จะติดแบบไหน แบบ Meter จะเด้งตามเสียงบนตัวเครื่องเอง",
                live: "สด",
                clickHint: "คลิกเฟดเดอร์เพื่อแก้เฉพาะตัวนั้น",
                noLevel: "แอปวัดระดับเสียงช่องนี้ไม่ได้",
                applyTo: "ใช้กับ",
                allFaders: "ทุกเฟดเดอร์",
                style: "รูปแบบ",
                styles: {
                    TwoColour: {name: "Two colour", desc: "สีล่างถึงตำแหน่งเฟดเดอร์ เหนือนั้นเป็นสีบน"},
                    Gradient: {name: "Gradient", desc: "ไล่สีจากล่างขึ้นบน ถึงตำแหน่งเฟดเดอร์"},
                    Meter: {name: "Meter", desc: "สีบนเป็นพื้น เสียงเด้งขึ้นเป็นสีล่าง"},
                    GradientMeter: {name: "Gradient meter", desc: "ไล่สี เด้งตามเสียง"},
                },
                pairs: "คู่สี",
                colours: "สี",
                top: "บน",
                topHint: "ไฟด้านบน / เสียงดัง",
                bottom: "ล่าง",
                bottomHint: "ไฟด้านล่าง / เสียงเบา",
                swap: "สลับ",
                swapHint: "สลับสีบนกับสีล่าง",
                note: "Two colour และ Gradient ติดตามตำแหน่งเฟดเดอร์ ส่วน Meter และ Gradient meter เด้งตามเสียงที่ผ่านช่องนั้น ช่องที่ไม่มีเสียงไฟจะดับ",
                mute: {
                    title: "ปุ่ม Mute",
                    muted: "ตอนปิดเสียง",
                    mutedHint: "สีตอนช่องถูกปิดเสียง",
                    unmuted: "ตอนไม่ปิดเสียง",
                    unmutedHint: "ใช้กับรูปแบบด้านล่างที่ใช้สีที่สอง",
                    match: "ใช้สีเดียวกับเฟดเดอร์",
                    matchHint: "ปุ่ม Mute แต่ละปุ่มใช้สีของเฟดเดอร์ตัวเอง: สีล่างตอนปิดเสียง สีบนตอนไม่ปิด",
                    offStyle: "ตอนไม่ปิดเสียง",
                },
                save: "เซฟลงโปรไฟล์",
                saved: "เซฟแล้วทั้งหมด",
                unsaved: "ยังไม่ได้เซฟ: ถอดสาย GoXLR แล้วจะหาย",
            },
            // Shared by the Global, Mixer, Effects, Sampler and Cough tabs
            shared: {
                whenOff: "ตอนดับ",
                offStyles: {
                    Dimmed: {name: "หรี่สีตอนเปิด", desc: "ตอนดับใช้สีตอนเปิดแบบหรี่"},
                    Colour2: {name: "สีตอนปิด", desc: "ตอนดับใช้สีที่สอง"},
                    DimmedColour2: {name: "หรี่สีตอนปิด", desc: "ตอนดับใช้สีที่สองแบบหรี่"},
                },
                on: "ตอนติด",
                off: "ตอนดับ",
                offHint: "ใช้กับรูปแบบด้านล่างที่ใช้สีที่สอง",
                swapHint: "สลับสีตอนติดกับตอนดับ",
                clickButton: "คลิกปุ่มเพื่อแก้เฉพาะปุ่มนั้น",
                isOn: "เปิด",
                isOff: "ปิด",
            },
            globalTab: {
                title: "ทั้งเครื่อง",
                lede: "แอนิเมชันไฟ ไฟโลโก้ และปุ่มเดียวทาสีไฟทั้งเครื่องเป็นสีเดียว",
                hint: "แอนิเมชันเล่นบนเครื่อง GoXLR ด้วย",
                animation: "แอนิเมชัน",
                modes: {
                    None: {name: "ไม่มี", desc: "สีอยู่นิ่ง"},
                    RetroRainbow: {name: "Retro rainbow", desc: "รุ้งไหลช้า ๆ"},
                    RainbowBright: {name: "Rainbow bright", desc: "รุ้งสว่างเต็มที่"},
                    RainbowDark: {name: "Rainbow dark", desc: "รุ้งโทนเข้ม"},
                    Simple: {name: "Simple", desc: "สีของคุณขยับเบา ๆ"},
                    Ripple: {name: "Ripple", desc: "คลื่นวิ่งผ่านเครื่อง"},
                },
                tuning: "ปรับแอนิเมชัน",
                mod1: "ความเร็ว (Mod 1)",
                mod2: "ความกว้าง (Mod 2)",
                waterfall: "ทิศทางไหล",
                water: {Up: "ขึ้น", Down: "ลง", Off: "ปิด"},
                notUsed: "แอนิเมชันนี้ไม่ใช้",
                unsupported: "เฟิร์มแวร์ของ GoXLR เครื่องนี้เล่นแอนิเมชันไฟไม่ได้ อัปเดตเฟิร์มแวร์ก่อนจึงจะใช้ได้",
                accent: "Accent",
                accentHint: "ไฟโลโก้ GoXLR",
                paint: "ทาสีทั้งเครื่อง",
                oneColour: "สีเดียว",
                oneColourHint: "ทุกปุ่ม ทุกวงไฟ ทุกเฟดเดอร์",
                paintButton: "ทาสีไฟทั้งหมด",
                paintWarning: "จะทับสีที่ตั้งไว้ในแท็บอื่นทั้งหมด กด ย้อนกลับ เพื่อเอาคืนได้",
                note: "ความเร็วกับความกว้างเปลี่ยนการเคลื่อนไหวของแอนิเมชัน ความกว้างใช้ได้เฉพาะรุ้งสว่างและรุ้งเข้ม ทิศทางไหลทำให้ไฟไหลขึ้นหรือลง",
            },
            mixerTab: {
                title: "มิกเซอร์",
                lede: "จอเล็กเหนือเฟดเดอร์แต่ละตัว และปุ่ม Mute ใต้เฟดเดอร์",
                screen: "จอ",
                backlight: "ไฟจอ",
                backlightHint: "จอเล็กเหนือเฟดเดอร์",
                matchFader: "ใช้สีบนของเฟดเดอร์",
                matchFaderHint: "จอแต่ละจอใช้สีบนของเฟดเดอร์ตัวเอง",
                notePrefix: "ปุ่ม Mute เป็นค่าเดียวกับในหน้าไฟเฟดเดอร์ ชื่อ ไอคอน และตัวเลขบนจอตั้งได้ที่",
            },
            effectsTab: {
                title: "เอฟเฟกต์",
                lede: "ปุ่มพรีเซ็ต 1 ถึง 6 วงไฟรอบปุ่มหมุนทั้งสี่ และปุ่มเอฟเฟกต์",
                clickHint: "คลิกปุ่มหรือปุ่มหมุนเพื่อแก้เฉพาะตัวนั้น",
                part: "ส่วน",
                parts: {presets: "ปุ่มพรีเซ็ต", knobs: "ปุ่มหมุน", buttons: "ปุ่มเอฟเฟกต์"},
                all: {presets: "ทุกพรีเซ็ต", knobs: "ทุกปุ่มหมุน", buttons: "ทุกปุ่มเอฟเฟกต์"},
                preset: "พรีเซ็ต {n}",
                buttonNames: {megaphone: "Megaphone", robot: "Robot", hard_tune: "Hardtune", fx: "FX"},
                left: "ซ้ายของค่า",
                leftHint: "จากศูนย์ถึงค่าปัจจุบัน",
                right: "ขวาของค่า",
                rightHint: "จากค่าปัจจุบันถึงสุด",
                knob: "ปุ่มหมุน",
                knobHint: "วงบนหัวปุ่ม",
                knobNote: "ปุ่มหมุนไม่มีแบบตอนดับ ไฟติดตลอด",
                onHint: {presets: "พรีเซ็ตที่ใช้อยู่", buttons: "ตอนเปิดเอฟเฟกต์"},
                note: {
                    presets: "เปิดได้ทีละพรีเซ็ต อีกห้าปุ่มจึงแสดงแบบตอนดับเสมอ",
                    buttons: "FX คือสวิตช์หลักของเอฟเฟกต์ Megaphone, Robot และ Hardtune ติดเมื่อเปิดอยู่",
                },
                onNowNone: "ตอนนี้ไม่มีอะไรเปิดอยู่",
                onNowOne: "ตอนนี้เปิดอยู่: {name}",
                onNowMany: "ตอนนี้เปิดอยู่: {list} และ {last}",
            },
            samplerTab: {
                title: "แซมเพลอร์",
                lede: "ปุ่มแบงก์ A, B และ C แพดทั้งสี่กับปุ่ม Clear ใช้สีของแบงก์ที่ใช้อยู่",
                clickHint: "คลิก A, B หรือ C เพื่อแก้เฉพาะแบงก์นั้น",
                bank: "แบงก์ {bank}",
                allBanks: "ทุกแบงก์",
                pads: {TopLeft: "บนซ้าย", TopRight: "บนขวา", BottomLeft: "ล่างซ้าย", BottomRight: "ล่างขวา"},
                hasSounds: "มีเสียง",
                empty: "ว่าง",
                inUse: "ตอนนี้ใช้แบงก์ {bank} แพดจึงแสดงสีของแบงก์นี้",
                onHint: "แบงก์ที่ใช้อยู่ แพดที่มีเสียง",
                offHint: "แบงก์อื่น",
                emptyPads: "แพดว่าง",
                emptyHint: "แพดที่ไม่มีเสียง (ดำ = ดับ)",
                note: "แพดทั้งสี่กับ Clear ใช้สีตามแบงก์ที่ใช้อยู่เสมอ GoXLR ตั้งสีแพดทีละอันไม่ได้",
            },
            coughTab: {
                title: "ปุ่มไอ",
                lede: "ปุ่ม Bleep และปุ่มปิดไมค์ใหญ่",
                both: "ทั้งสองปุ่ม",
                bleep: "Bleep",
                cough: "ปิดไมค์",
                onHint: "ตอนกดหรือปิดไมค์",
                state: "ปิดไมค์: {cough} · Bleep: {bleep}",
                note: "สีแดงเป็นสีเตือนที่คนคุ้นสำหรับไมค์ที่ปิดอยู่",
            },
            // These are some common strings that are used in multiple places
            common: {
                colour: "สี",

                activeColour: "สีตอนเปิด",
                inactiveColour: "สีตอนปิด",

                inactiveOption: "ตัวเลือกตอนปิด",
                inactiveOptions: {
                    dimActiveColour: "หรี่สีตอนเปิด",
                    inactiveColour: "สีตอนปิด",
                    dimInactiveColour: "หรี่สีตอนปิด"

                },

                applyToAll: "ใช้กับทั้งหมด",
            },

            global: {
                areas: {
                    title: "พื้นที่",

                    area: "พื้นที่",
                    areas: {
                        global: "ทั้งเครื่อง",
                        accent: "ไฟเน้น",
                    },

                    colour: "@:message.lighting.common.colour",
                },

                animations: {
                    title: "แอนิเมชัน",

                    mode: "โหมดแอนิเมชัน",
                    modes: {
                        none: "ไม่มี",
                        rainbowRetro: "Rainbow Retro",
                        rainbowBright: "Rainbow Bright",
                        rainbowDark: "Rainbow Dark",
                        simple: "Simple",
                        ripple: "Ripple",
                    },

                    mod1: "ปรับไล่สี 1",
                    mod2: "ปรับไล่สี 2",

                    waterfall: "ตั้งค่าน้ำตก",
                    waterfallOff: "ปิด",
                }
            },

            mixer: {
                faders: {
                    title: "@:message.configuration.faders.title",
                    channelTitle: "@:message.configuration.faders.channel",
                },

                fader: {
                    title: "เฟดเดอร์",

                    style: "สไตล์",
                    styles: {
                        gradient: "ไล่สี",
                        meter: "มิเตอร์",
                    },

                    bottomColour: "สีด้านล่าง",
                    topColour: "สีด้านบน",

                    accessibilityTitle: "ตั้งค่าเฟดเดอร์ของ {channel}",
                },

                screen: {
                    title: "หน้าจอ",
                    backgroundColour: "สีพื้นหลัง",
                    icons: "ไอคอน",
                    iconNone: "-- ไม่มี --",

                    optionsTitle: "ตัวเลือก",
                    options: {
                        showNumber: "แสดงตัวเลข",
                        invertDisplay: "กลับสีหน้าจอ",
                        text: "ข้อความ",

                        accessibilityText: "ข้อความที่จะแสดงบนหน้าจอ GoXLR"
                    }
                },

                mute: {
                    // Pretty much all other fields for this area come from 'Common'
                    title: "ปิดเสียง",
                    accessibilityTitle: "ตั้งค่าปุ่มปิดเสียงของ {channel}"
                }
            },

            effects: {
                preset: {
                    title: "ปุ่มพรีเซ็ต",
                    presetTitle: "พรีเซ็ต"
                },

                encoders: {
                    title: "ปุ่มหมุน",

                    encoder: "ปุ่มหมุน",
                    encoders: {
                        reverb: "Reverb",
                        echo: "Echo",
                        pitch: "Pitch",
                        gender: "Gender",
                    },

                    leftColour: "สีด้านซ้าย",
                    rightColour: "สีด้านขวา",
                    knobColour: "สีปุ่มหมุน"
                },

                buttons: {
                    title: "ปุ่มเอฟเฟกต์",

                    effectTitle: "เอฟเฟกต์",
                    effect: {
                        megaphone: "Megaphone",
                        robot: "Robot",
                        hardTune: "Hardtune",
                        fx: "Fx"
                    }
                },
            },
            sampler: {
                title: "แบงก์",

                buttonsTitle: "ปุ่ม",
                buttons: {
                    a: "A",
                    b: "B",
                    c: "C"
                },

                active: "เปิด / มีแซมเปิล",
                empty: "ไม่มีแซมเปิล",
                inactive: "แบงก์ที่ไม่ได้ใช้",
            },

            cough: {
                title: "ปุ่ม Cough/Bleep",

                buttonsTitle: "ปุ่ม",
                buttons: {
                    bleep: "Bleep",
                    cough: "Cough",
                }
            },
        },

        routing: {
            title: "เส้นทางเสียง",

            input: "อินพุต",
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

            output: "เอาต์พุต",
            outputs: {
                Headphones: "@:message.channels.Headphones",
                BroadcastMix: "@:message.channels.StreamMix",
                StreamMix2: "@:message.channels.StreamMix2",
                ChatMic: "@:message.channels.ChatMic",
                Sampler: "@:message.channels.Sampler",
                LineOut: "@:message.channels.LineOut",
                VOD: "@:message.channels.VOD",
            },
            // หน้า Routing แบบใหม่ (mockup docs/mockups/2026-10-29-routing)
            pageHint: "เลือกว่าใครได้ยินเสียงไหน แต่ละแถวคือที่ที่เสียงไปถึง แต่ละคอลัมน์คือเสียง คลิกช่องเพื่อเปิดหรือปิด",
            mixBSameSwitch: "สวิตช์เดียวกับหน้า Mixer",
            micShort: "ไมค์",
            broadcast: "Broadcast Stream Mix",
            broadcast1: "Broadcast Stream Mix 1",
            whoHearsWhat: "ใครได้ยินอะไร",
            gridHelp: "Routing แค่เปิดหรือปิดเสียงสำหรับแต่ละที่ ความดังมาจากเฟดเดอร์",
            hoverHint: "ชี้ที่ช่องเพื่อดูความหมาย",
            soundsInputs: "เสียง (อินพุต)",
            goesToOutputs: "ไปที่ (เอาต์พุต)",
            recording: "การอัด",
            paused: "พักไว้",
            listenOn: "หูฟังกำลังเล่นอันนี้",
            listenTo: "ฟัง {name} ในหูฟัง",
            listenBanner: "หูฟังของคุณกำลังเล่น {name} คุณจึงได้ยินสิ่งที่แถวนั้นส่งออก ค่าที่แก้ในแถว Headphones จะเก็บไว้ และกลับมาเมื่อสลับกลับ",
            listenBack: "กลับไปฟัง Headphones",
            volumeSet: "ชุดความดังของ {name}",
            useMix: "ใช้ความดังของ Mix {mix}",
            tip: "เคล็ดลับ",
            tipText: "ชี้ที่ช่องใดก็ได้ บรรทัดนี้จะบอกเป็นคำง่าย ๆ ว่าใครได้ยินอะไร",
            locked: "ล็อก",
            lockedText: "GoXLR ส่ง Chat กลับเข้า Chat Mic ไม่ได้ ไม่งั้นคนในสายจะได้ยินเสียงตัวเอง",
            on: "เปิด",
            off: "ปิด",
            yourMic: "ไมค์ของคุณ",
            sentence: "{who} {sound}",
            pausedNote: "เก็บไว้ก่อน ตอนนี้หูฟังกำลังเล่น {name}",
            listeningNote: "คุณได้ยินด้วย เพราะกำลังฟังแถวนี้อยู่",
            legendOn: "เปิด",
            legendStream: "เปิด ส่งไปสตรีม",
            legendLocked: "GoXLR ล็อกไว้",
            legendListen: "ฟัง: เล่นเอาต์พุตนี้ในหูฟัง (ทีละอัน)",
            legendMixOn: "A / B: เอาต์พุตนี้ใช้ความดังเฟดเดอร์ชุดไหน (ตั้งที่หน้า Mixer)",
            legendMixOff: "ชุดความดัง A / B จะขึ้นเมื่อเปิด Mix B",
            plainWords: "สรุปง่าย ๆ",
            plainWordsSub: "อัปเดตตามที่คลิก",
            nothing: "ไม่มี",
            notList: "ไม่ได้ยิน: {list}",
            playingNow: "กำลังเล่นในหูฟังตอนนี้",
            pausedWhile: "พักไว้ระหว่างฟัง {name}",
            inputWhat: {
                Microphone: "เสียงคุณ",
                Chat: "สายคุย",
                Music: "แอปเพลง",
                Game: "เกมของคุณ",
                Console: "ช่องคอนโซล",
                LineIn: "ช่อง Line In",
                System: "เสียง Windows",
                Samples: "แพดแซมเปิล",
            },
            outputWhat: {
                Headphones: "สิ่งที่คุณได้ยิน",
                BroadcastMix: "คนดูและไฟล์อัด",
                StreamMix2: "สตรีมมิกซ์ชุดที่สอง",
                LineOut: "ช่อง Line Out (ลำโพง, PC เครื่องที่สอง)",
                ChatMic: "สิ่งที่คนในสายได้ยิน",
                Sampler: "สิ่งที่แพดอัดได้",
            },
            outputWho: {
                Headphones: "คุณได้ยิน",
                BroadcastMix: "คนดูได้ยิน",
                StreamMix2: "Stream Mix 2 ได้",
                LineOut: "Line Out เล่น",
                ChatMic: "คนในสายได้ยิน",
                Sampler: "แซมเปิลใหม่อัด",
            },
            outputWhoNot: {
                Headphones: "คุณไม่ได้ยิน",
                BroadcastMix: "คนดูไม่ได้ยิน",
                StreamMix2: "Stream Mix 2 ไม่ได้",
                LineOut: "Line Out ไม่เล่น",
                ChatMic: "คนในสายไม่ได้ยิน",
                Sampler: "แซมเปิลใหม่ไม่อัด",
            },
        },

        system: {
            title: "ระบบ",

            powerButton: "การทำงานเมื่อปิด/เปิดเครื่อง",
            power: {
                shutdownTitle: "เมื่อปิดโปรแกรม",
                shutdownDescription: "คำสั่งเหล่านี้จะทำงานเมื่อปิด GoXLR Utility อย่างถูกต้อง",

                sleepTitle: "เมื่อเครื่องเข้าโหมด Sleep",
                sleepDescription: "คำสั่งเหล่านี้จะทำงานเมื่อคอมพิวเตอร์กำลังเข้าโหมด Sleep",

                wakeTitle: "เมื่อเครื่องตื่น",
                wakeDescription: "คำสั่งเหล่านี้จะทำงานเมื่อคอมพิวเตอร์ตื่นจากโหมด Sleep",

                settingsError: "ดูเหมือนไฟล์ตั้งค่าถูกแก้ไขด้วยมือ เพื่อป้องกันการทำงานผิดปกติ ส่วนนี้จึงถูกปิดไว้ หากต้องการรีเซ็ตคำสั่งเมื่อปิดโปรแกรมทั้งหมด ให้กดปุ่มด้านล่าง",
                settingsReset: "รีเซ็ตคำสั่งเมื่อปิดโปรแกรม",

                power_options: {
                    reload: "โหลดการตั้งค่าใหม่",
                    saveProfile: "บันทึกโปรไฟล์",
                    loadProfile: "โหลดโปรไฟล์ทั้งหมด",
                    loadColourProfile: "โหลดเฉพาะสีของโปรไฟล์",
                    saveMicProfile: "บันทึกโปรไฟล์ไมค์",
                    loadMicProfile: "โหลดโปรไฟล์ไมค์",
                }
            },

            deviceButton: "ตั้งค่าอุปกรณ์",
            device: {
                holdDuration: "ระยะเวลากดปุ่ม Mute ค้างเพื่อปิดเสียงทั้งหมด",
                holdDurationAccessibility: "ระยะเวลาเป็นมิลลิวินาทีที่ต้องกดปุ่ม Mute ค้างไว้เพื่อปิดเสียงทุกแชนเนล",

                sampleBuffer: "บัฟเฟอร์อัดล่วงหน้าของแซมเพลอร์ (วินาที)",
                sampleBufferAccessibility: "ระยะเวลาเป็นวินาทีที่แซมเพลอร์จะอัดเสียงไว้ก่อนกดปุ่ม",

                voiceDeafen: "ปิดเสียง Voice Chat ทั้งหมด จะปิดไมค์ไปยัง Chat Mic ด้วย",
                voiceDeafenAccessibility: "เมื่อปิดเสียง Voice Chat ไปยังทุกแชนเนล จะปิดไมค์ไปยัง Chat Mic ด้วย",

                monitorWithFx: "เปิด/ปิดมอนิเตอร์ไมค์ตามสถานะ FX",
                monitorWithFxAccessibility: "เปิดมอนิเตอร์ไมค์เมื่อเปิด FX",

                resetSampleFunctionOnClear: "รีเซ็ตการทำงานของแซมเปิลเมื่อล้าง",
                resetSampleFunctionOnClearAccessibility: "รีเซ็ตการทำงานของแซมเปิลกลับเป็น เล่น / ถัดไป เมื่อล้าง",

                lockFaders: "ล็อกตำแหน่งเฟดเดอร์เมื่อปิดเสียงทั้งหมด",
                lockFadersAccessibility: "ป้องกันไม่ให้เฟดเดอร์เลื่อนลงเมื่อเปิดใช้การปิดเสียงทั้งหมด",

                samplerFadeDuration: "ระยะเวลาเฟดของแซมเพลอร์",
                samplerFadeDurationAccessibility: "ระยะเวลาเป็นมิลลิวินาทีที่แซมเพลอร์จะค่อยๆ เบาลงเมื่อหยุดเล่น",
            },

            settingsButton: "ตั้งค่าโปรแกรม",
            settings: {
                language: "ภาษา",
                useSystem: "ใช้ภาษาของระบบ (ถ้ามี)",

                uiHandler: "เปิดหน้าจอด้วย",
                uiHandlers: {
                    browser: "เบราว์เซอร์",
                    app: "แอป",
                    custom: "กำหนดเอง"
                },


                logLevel: "ระดับ Log (ต้องรีสตาร์ท)",
                logLevels: {
                    off: "ปิด",
                    error: "Error",
                    warn: "Warn",
                    info: "Info",
                    debug: "Debug",
                    trace: "Trace"

                    // OFF / ERROR / WARN / INFO / DEBUG / TRACE
                },

                firmwareSource: "ช่องทางอัปเดตเฟิร์มแวร์",
                firmwareSources: {
                    live: "ปกติ",
                    beta: "เบต้า"
                },

                allowNetworkAccess: "อนุญาตให้เข้าหน้าจอผ่านเครือข่าย (ต้องรีสตาร์ท)",
                allowNetworkAccessAccessibility: "อนุญาตให้อุปกรณ์อื่นในเครือข่ายเข้าถึงหน้าจอได้",

                autoStart: "เปิดอัตโนมัติเมื่อล็อกอิน",
                autoStartAccessibility: "เปิด GoXLR Utility เมื่อผู้ใช้ล็อกอิน",

                showOnLaunch: "แสดงหน้าจอเมื่อเปิดโปรแกรม",
                showOnLaunchAccessibility: "เปิดหน้าจออัตโนมัติเมื่อเริ่มโปรแกรม",

                showTray: "แสดงไอคอนที่ทาสก์บาร์ (ต้องรีสตาร์ท)",
                showTrayAccessibility: "แสดงไอคอน GoXLR Utility ในถาดระบบ",

                ttsOnButton: "อ่านออกเสียงเมื่อกดปุ่ม",
                ttsOnButtonAccessibility: "อ่านสถานะปุ่มออกเสียงเมื่อกด ผ่านโปรแกรมอ่านหน้าจอหรือเสียงสังเคราะห์ของระบบ",

                recoverDefaults: "กู้คืนค่าเริ่มต้น",
                recoverOptions: {
                    profiles: "โปรไฟล์",
                    micProfiles: "โปรไฟล์ไมค์",
                    icons: "ไอคอน",
                    presets: "พรีเซ็ต"
                },

                shutdownUtility: "ปิด GoXLR Utility",

                shutdownConfirmTitle: "แน่ใจหรือไม่?",
                shutdownConfirmMessage: "ต้องการปิด GoXLR Utility ใช่หรือไม่?",

                settingsRegionAccessibility: "การตั้งค่า",

                macosAggregateManagement: "ปิดการจัดการ Aggregate ของ MacOS (ต้องรีสตาร์ท)",
                macosAggregateManagementAccessibility: "ปิดการจัดการ Aggregate ของ Utility บน MacOS (ต้องรีสตาร์ท)",
            },

            aboutButton: "เกี่ยวกับ GoXLR",
            about: {
                serial: "หมายเลขเครื่อง",
                utilityVersion: "เวอร์ชัน Utility",
                driverVersion: "เวอร์ชันไดรเวอร์",
                hardwareVersion: "เวอร์ชันฮาร์ดแวร์",

                firmware: "เฟิร์มแวร์",
                dice: "DICE",
                fpga: "FPGA",
            },

            firmwareUpdateButton: {
                update: "อัปเดตเฟิร์มแวร์",
                downgrade: "ดาวน์เกรดเฟิร์มแวร์",
                reinstall: "ติดตั้งเฟิร์มแวร์ใหม่",
                custom: "เฟิร์มแวร์กำหนดเอง",
            },
            firmwareUpdate: {
                newVersionAvailable: "มีเฟิร์มแวร์เวอร์ชันใหม่ ({latestVersion}) สำหรับอุปกรณ์ของคุณ\nต้องการอัปเดตตอนนี้หรือไม่?",
                currentVersionIsNewer: "เฟิร์มแวร์ปัจจุบัน ({currentVersion}) ใหม่กว่าเวอร์ชันล่าสุดที่มีให้ ({latestVersion})\nต้องการดาวน์เกรดเป็นเวอร์ชันล่าสุดหรือไม่?",
                currentIsUpToDate: "เฟิร์มแวร์เป็นเวอร์ชันล่าสุดแล้ว\nต้องการติดตั้งเวอร์ชันปัจจุบันซ้ำหรือไม่?",
                customFirmware: "คุณกำลังจะติดตั้งเฟิร์มแวร์กำหนดเอง\nไม่แนะนำ เว้นแต่คุณรู้ว่ากำลังทำอะไรอยู่\nแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?",

                warning: "คุณกำลังจะแฟลชเฟิร์มแวร์เวอร์ชันใหม่ลงอุปกรณ์\nผู้พัฒนา GoXLR Utility ไม่รับผิดชอบต่อความเสียหายใดๆ ที่อาจเกิดจากขั้นตอนนี้ ",
                warningInfo: "ข้อมูลเพิ่มเติม",

                betaWarning: "คุณกำลังจะติดตั้งเฟิร์มแวร์เวอร์ชันเบต้า\nเวอร์ชันนี้ไม่มีการซัพพอร์ตอย่างเป็นทางการ และอาจมีบั๊กหรือปัญหาที่เราแก้ไขไม่ได้",

                updatePaused: "คุณกำลังจะติดตั้งเฟิร์มแวร์เวอร์ชัน {version} แน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?",
                updateInProgress: "กำลังอัปเดตเฟิร์มแวร์ กรุณารอและห้ามถอดสายอุปกรณ์!",
                completed: "อัปเดตเฟิร์มแวร์สำเร็จแล้ว",
                failed: "เกิดข้อผิดพลาดระหว่างอัปเดตเฟิร์มแวร์ กรุณาลองใหม่อีกครั้ง",

                changelog: "รายการเปลี่ยนแปลงเวอร์ชัน {version}:",
                title: "กำลังติดตั้งเฟิร์มแวร์...",

                progress: {
                    starting: "กำลังเริ่ม...",
                    manifest: "กำลังดึงข้อมูลเวอร์ชัน...",
                    download: "กำลังดาวน์โหลดเฟิร์มแวร์...",
                    pause: "หยุดการอัปเดตชั่วคราว",
                    clearNVR: "กำลังเตรียมพื้นที่สำหรับอัปเดต...",
                    uploadFirmware: "กำลังอัปโหลดเฟิร์มแวร์...",
                    validateUpload: "กำลังตรวจสอบเฟิร์มแวร์ที่อัปโหลด...",
                    hardwareWrite: "กำลังเขียนเฟิร์มแวร์...",
                    hardwareValidate: "กำลังตรวจสอบเฟิร์มแวร์...",
                    complete: "อัปเดตเสร็จสมบูรณ์",
                    failed: "อัปเดตเฟิร์มแวร์ไม่สำเร็จ",
                }
            },

            licenses: "สัญญาอนุญาต",
            help: "ช่วยเหลือ",
        },

        deviceSelector: {
            title: "เลือกอุปกรณ์",
            connecting: "กำลังเชื่อมต่อ GoXLR Utility..",
            disconnected: "เชื่อมต่อ GoXLR Utility ไม่ได้ กรุณาตรวจสอบว่าโปรแกรมทำงานอยู่\n\nหน้านี้จะพยายามเชื่อมต่อใหม่อัตโนมัติ..",
            noDevices: "ไม่พบอุปกรณ์ GoXLR",
        },

        versionCheck: {
            updateAvailable: "มีอัปเดตใหม่",
            firmwareDirectionAvailable: "มี{direction}เฟิร์มแวร์",
            firmwareDirections: {
                update: "อัปเดต",
                downgrade: "ดาวน์เกรด",
                unknown: "ไม่ทราบ",
            },
            incompatibleDriver: "ไดรเวอร์ที่ติดตั้งอยู่ใช้กับเฟิร์มแวร์นี้ไม่ได้ คลิกที่นี่เพื่อดาวน์โหลดไดรเวอร์ล่าสุด",
        },

        // Strings used in Profile and Microphone Profile Management.
        profileManager: {
            // Accessibility Titles for the buttons at the bottom of the Profile List
            saveProfileName: "บันทึกโปรไฟล์ {profileName}",
            createProfile: "สร้างโปรไฟล์",

            // Dialog Popup when clicking 'Create Profile' Button
            newTitle: "สร้างโปรไฟล์ใหม่จาก",
            newQuestion: "ต้องการสร้างโปรไฟล์ใหม่จากค่าเริ่มต้น หรือจากการตั้งค่าปัจจุบัน?",
            newDefaultButton: "ค่าเริ่มต้น",
            newCurrentButton: "ปัจจุบัน",
            newCancelButton: "@:message.modalButtons.cancel",

            // Dialog Popup when hitting the 'Save Profile' button
            overwriteTitle: "ยืนยันการเขียนทับ",
            overwriteQuestion: "แน่ใจหรือไม่ว่าต้องการเขียนทับโปรไฟล์ {activeProfile}?",
            overwriteYes: "@:message.modalButtons.yes",
            overwriteNo: "@:message.modalButtons.no",

            // Dialog Popup when clicking the 'Delete' Menu Item
            deleteTitle: "ยืนยันการลบ",
            deleteQuestion: "แน่ใจหรือไม่ว่าต้องการลบโปรไฟล์ {profileName}?",
            deleteYes: "@:message.modalButtons.yes",
            deleteNo: "@:message.modalButtons.no",

            // Dialog prompting for a new Profile Name
            newNameTitle: "ตั้งชื่อโปรไฟล์ใหม่",
            newNamePlaceHolder: "ชื่อใหม่",
            newNameOk: "@:message.modalButtons.ok",
            newNameCancel: "@:message.modalButtons.cancel",

            // Dialog Popup when attempting to delete the active profile
            deleteCurrentErrorTitle: "ลบไม่ได้",
            deleteCurrentErrorMessage: "ไม่สามารถลบโปรไฟล์ที่กำลังใช้งานอยู่ได้",

            // Items in the Popup Menu on Profiles
            menuLoadProfile: "โหลดโปรไฟล์",
            menuLoadProfileColours: "โหลดเฉพาะสี",
            menuDuplicateProfile: "ทำสำเนาโปรไฟล์",
            duplicateTitle: "ทำสำเนา {profileName}",
            duplicateName: "{profileName} สำเนา",
            menuDeleteProfile: "ลบโปรไฟล์",


            // Accessibility Messages (these are announced to screen readers)
            accessibilityLoadedProfile: "โหลดโปรไฟล์ {profileName} แล้ว",
            accessibilityLoadedColours: "โหลดสีของโปรไฟล์ {profileName} แล้ว",
            accessibilityCreatedProfile: "สร้างโปรไฟล์ {profileName} แล้ว",
            accessibilitySavedProfile: "บันทึกโปรไฟล์ {profileName} แล้ว",
            accessibilitySavedProfileAs: "บันทึกโปรไฟล์ {profileName} เป็น {newProfileName} แล้ว",
            accessibilityProfileDeleted: "ลบโปรไฟล์ {profileName} แล้ว",
            accessibilityActiveProfile: "โปรไฟล์ที่ใช้งาน",
            accessibilityDropMenuTitle: "ตัวเลือกของ {profileName}",
            accessibilityOpenProfileDirectory: "เปิดโฟลเดอร์โปรไฟล์",
            accessibilityOpenMicProfileDirectory: "เปิดโฟลเดอร์โปรไฟล์ไมค์",
        },
    }
}
