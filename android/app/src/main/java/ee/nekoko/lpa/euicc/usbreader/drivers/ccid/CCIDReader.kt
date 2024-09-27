package ee.nekoko.lpa.euicc.usbreader.drivers.ccid

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbConstants
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbEndpoint
import android.hardware.usb.UsbInterface
import android.hardware.usb.UsbManager
import android.os.Build
import android.util.Log
import ee.nekoko.lpa.euicc.base.EuiccSlot
import im.nfc.ccid.Ccid
import im.nfc.ccid.CcidException
import im.nfc.ccid.Protocol

data class CCIDReader (
    var name: String,
    var deviceName: String,
    var interfaceIdx: Int,
    var ccid: Ccid?,
    var usbManager: UsbManager,
    var device: UsbDevice,
    var context: Context,
) {

    var slot: EuiccSlot? = null

    private fun getEndpoints(usbInterface: UsbInterface): Pair<UsbEndpoint, UsbEndpoint> {
        var bulkIn: UsbEndpoint? = null
        var bulkOut: UsbEndpoint? = null
        for (i in 0 until usbInterface.endpointCount) {
            val endpoint = usbInterface.getEndpoint(i)
            if (endpoint.type == UsbConstants.USB_ENDPOINT_XFER_BULK) {
                if (endpoint.direction == UsbConstants.USB_DIR_IN) {
                    bulkIn = endpoint
                } else {
                    bulkOut = endpoint
                }
            }
        }
        if (bulkIn == null || bulkOut == null) {
            throw Exception("Bulk endpoints not found")
        }
        return Pair(bulkIn, bulkOut)
    }

    @OptIn(ExperimentalStdlibApi::class)
    private fun connectToInterface(): Ccid? {

        Log.e(TAG, "Connecting: Current CCID: ${ccid}")
        Log.e(TAG, "Connecting: Current USB Connection: ${ccid?.usbDeviceConnection}")
        val usbInterface = device.getInterface(interfaceIdx)
        val usbConnection = usbManager.openDevice(device)
        if (usbConnection == null) {
            Log.e(TAG, "Failed to open device")
            return null
        }
        val endpoints = getEndpoints(usbInterface)
        val _ccid = Ccid(usbConnection, endpoints.first, endpoints.second)
        val descriptor = _ccid.getDescriptor(interfaceIdx)
        if (descriptor?.supportsProtocol(Protocol.T0) != true) {
            Log.d(TAG, "Unsupported protocol")
            return null
        }
        if (!usbConnection.claimInterface(usbInterface, true)) {
            Log.e(TAG, "Failed to claim interface")
            return null
        }
        for(i in 0 until 4) {
            // AUTO, 5V, 3V, 1.8V
            if ((descriptor.voltage and (1 shl i)) > 0) {
                try {
                    Log.d(TAG, "Trying Supported Voltage #$i")
                    val atr = _ccid.iccPowerOn(i.toByte())
                    Log.d(TAG, "ATR: ${atr.toHexString()}")
                    return _ccid
                } catch (ex: Exception) {
                    Log.d(TAG, "Voltage #$i Failed")
                }
            }
        }
        throw Exception("Power On failed")
    }

    @Throws(Exception::class)
    fun transmitToCard(command: ByteArray): ByteArray {
        if (ccid == null) {
            throw Exception("CCID_READER_NOT_CONNECTED")
        }
        try {
            val resp = ccid!!.xfrBlock(command)
            return resp
        } catch (ex: CcidException) {
            ccid = null
            connectCard()
            val resp = ccid!!.xfrBlock(command)
            return resp
        }
    }

    fun disconnectCard() {
        ccid?.usbDeviceConnection?.close()
        ccid = null
    }

    fun resetCard() {
        disconnectCard()
        connectCard()
    }

    val isConnected: Boolean
        get() = (ccid != null)

    fun connectCard() {
        val _ccid = connectToInterface()
        if (_ccid != null) {
            Log.i(TAG, "Connecting Reader: $name")
            ccid = _ccid
        } else {
            throw Exception("CCID_READER_CONNECT_ERROR")
        }
    }

    companion object {
        private val TAG: String = CCIDReader::class.java.name
    }
}