# Control PLAYBULB via Node.js.

Currently only PLAYBULB SMART is supported.

## GATT Specification

### PLAYBULB SMART
- Service : 180D (Heart Rate)
- Characteristic : 2A39 (Heart Rate Control Point)

| write data | function |
|:--|:--|
|0x0000|one step darker|
|0x0001|one step blighter|
|0x01**|set blightness to **|

Blightness value will be clamped 0x00-0x14. (21steps)

## Sample application
launch `control_by_audio.app` and `control_smart_via_osc.js`

```
$ open control_by_audio.app
$ npm install
$ node control_smart_via_osc.js
```

## Lisence
MIT