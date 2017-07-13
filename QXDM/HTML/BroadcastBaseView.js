

// KEY Pressed
var EVENT_MEDIA_PLAYER_KEYPRESS = 1345 ;
var firstOnloadHappend = false ; 
// QTV LOGS
var LOG_QTV_Frame_Decode_Information = 0x11C3;
var LOG_QTV_Frame_Render_Information = 0x11B3;
var LOG_QTV_Audio_Video_Sync         = 0x11B4 ;
var QTV_PCR_Drift_Rate                = 0x11C8 ;

// QTV EVENTS
var EVENT_QTV_CLIP_STARTED                  = 904 ; 
var EVENT_QTV_CLIP_ENDED                    = 905 ; 
var EVENT_QTV_DSP_INIT                      = 914 ; 
var EVENT_QTV_STREAMING_SERVER_URL          = 915 ; 
var EVENT_QTV_STREAMER_STATE_IDLE           = 918 ; 
var EVENT_QTV_STREAMER_STATE_CONNECTING     = 919 ; 
var EVENT_QTV_STREAMER_STATE_SETTING_TRACKS = 920 ; 
var EVENT_QTV_STREAMER_STATE_STREAMING      = 921 ; 
var EVENT_QTV_STREAMER_CONNECTED            = 924;
var EVENT_QTV_STREAMER_INITSTREAM_FAIL      = 925 ; 
var EVENT_QTV_BUFFERING_STARTED             = 926 ; 
var EVENT_QTV_BUFFERING_ENDED               = 927 ; 
var EVENT_QTV_STREAMING_URL_OPEN            = 946 ; 
var EVENT_QTV_FIRST_VIDEO_FRAME_RENDERED    = 952 ; 
var EVENT_QTV_FIRST_VIDEO_I_FRAME_RENDERED  = 953 ; 


// QTV Global Variables
var cnt_fps= 0 ;  ; 
var ISDBT_JAPAN_FPS = 15 ;
var ISDBT_BRAZIL_FPS = 30 ;
var CMMB_CHINA_FPS  = 25;
var desired_fps = ISDBT_BRAZIL_FPS ; 
 
var qtv_fps_buf_len = desired_fps ; // handling a buffer of 1 swcond 
var dt_frames = 1/desired_fps ; // 
var sum = qtv_fps_buf_len * dt_frames ; 
var cyc_idx = 0 ; 
var curr_render_ts = -1 ; 
var QTV_DeltaT_between_Frames =dt_frames ; 
var QTV_DeltaT_array = new Array(qtv_fps_buf_len) ; 
init_qtv_fps_array();

var QTV_curr_DeltaT_between_Frames=0 ; 
var qtv_fps_first_time = true; 
var checkFPS_ts ; 
var prev_render_ts=-1 ;
var QTV_Frame_type = -1 ;
var prev_QTV_Frame_type = -1; 
var QTV_lag_lead_AV_Sync = -1 ;   
var EVENT_QTV_CLIP_STARTED_received = false ; 

// CMMB Events
var EVENT_DTV_CMMB_API_CALL_ACTIVATE                               = 1757 ;  
var EVENT_DTV_CMMB_API_CALL_DEACTIVATE                             = 1758 ;  
var EVENT_DTV_CMMB_API_CALL_TUNE                                   = 1759   ;  
var EVENT_DTV_CMMB_API_CALL_SELECT_SERVICE                         = 1760   ;  
var  EVENT_DTV_CMMB_API_CALL_DESELECT_SERVICE                      = 1761 ;  
var  EVENT_DTV_CMMB_API_CALL_GET_SIGNAL_PARAMETERS                 = 1762 ;  
var  EVENT_DTV_CMMB_API_CALL_GET_NIT                               = 1763 ;  
var  EVENT_DTV_CMMB_API_CALL_GET_CMCT                              = 1764  ;  
var  EVENT_DTV_CMMB_API_CALL_GET_SMCT                              = 1765 ;  
var  EVENT_DTV_CMMB_API_CALL_GET_CSCT                              = 1766 ;  
var  EVENT_DTV_CMMB_API_CALL_GET_SSCT                              = 1767 ;  
var  EVENT_DTV_CMMB_API_CALL_GET_EADT                              = 1768 ;
var  EVENT_DTV_CMMB_API_CALL_REQUEST_CA_CARD_NUMBER                = 1769    
var  EVENT_DTV_CMMB_API_CALL_REQUEST_CAS_VERSION                   = 1770 ;  
var  EVENT_DTV_CMMB_API_CALL_REGISTER_FOR_CONTROL_NOTIFICATIONS    = 1771 ;  
var  EVENT_DTV_CMMB_API_CALL_DEREGISTER_FROM_CONTROL_NOTIFICATIONS = 1772 ;  
var  EVENT_DTV_CMMB_API_NOTIFICATION_ACTIVATE                      = 1773 ;  
var  EVENT_DTV_CMMB_API_NOTIFICATION_DEACTIVATE                    = 1774 ;              
var  EVENT_DTV_CMMB_API_NOTIFICATION_TUNE                          = 1775; 
var  EVENT_DTV_CMMB_API_NOTIFICATION_SELECT_SERVICE                = 1776 ;  
var  EVENT_DTV_CMMB_API_NOTIFICATION_DESELECT_SERVICE              = 1777 ;  
var EVENT_DTV_CMMB_API_NOTIFICATION_TABLE_UPDATE                   = 1778 ; 
var  EVENT_DTV_CMMB_API_NOTIFICATION_SIGNAL_PARAMETERS             = 1779 ; 
var  EVENT_DTV_CMMB_API_NOTIFICATION_AUTHORIZATION_FAILURE         = 1780 ;  
var  EVENT_DTV_CMMB_API_NOTIFICATION_REGISTER_FOR_CONTROL_NOTIFICATIONS_COMPLETE = 1781 ;  
var  EVENT_DTV_CMMB_API_NOTIFICATION_DEREGISTER_FROM_CONTROL_NOTIFICATIONS_COMPLETE = 1782 ;  
var EVENT_DTV_CMMB_API_NOTIFICATION_CA_CARD_NUMBER                  = 1783 ;  
var EVENT_DTV_CMMB_API_NOTIFICATION_CAS_VERSION                      = 1784 ;  
var  EVENT_DTV_CMMB_API_NOTIFICATION_EMERGENCY_BROADCASTING_TRIGGER = 1785 ;  
var EVENT_DTV_CMMB_API_NOTIFICATION_EMERGENCY_BROADCASTING_MESSAGE  = 1786 ;  
var EVENT_DTV_CMMB_API_CALL_REGISTER_FOR_ESG_NOTIFICATIONS           = 1787 ;  
var EVENT_DTV_CMMB_API_CALL_DEREGISTER_FROM_ESG_NOTIFICATIONS                    = 1788 ;  
var EVENT_DTV_CMMB_API_CALL_GET_BASIC_DESCRIPTION_INFORMATION                    = 1789 ;  
var EVENT_DTV_CMMB_API_CALL_SET_OUTPUT_PATH                                      = 1790 ;  
var EVENT_DTV_CMMB_API_NOTIFICATION_ESG_DATA_INFORMATION                         = 1791 ;  
var  EVENT_DTV_CMMB_API_NOTIFICATION_ESG_DATA_INFORMATION_DOWNLOAD_COMPLETE      = 1792 ;  
var  EVENT_DTV_CMMB_API_NOTIFICATION_ESG_PROGRAM_INDICATION_INFORMATION          = 1793 ;  
var  EVENT_DTV_CMMB_API_NOTIFICATION_REGISTER_FOR_ESG_NOTIFICATIONS_COMPLETE     = 1794 ;  
var  EVENT_DTV_CMMB_API_NOTIFICATION_DEREGISTER_FROM_ESG_NOTIFICATIONS_COMPLETE  =  1795 ;  
var EVENT_DTV_CMMB_CAS_INITIALIZED                                               =    1796 ;  
var  EVENT_DTV_CMMB_CAS_EMM_RECEIVED_AND_PROCESSED                               = 1797 ;  
var EVENT_DTV_CMMB_CAS_ECM_RECEIVED_AND_PROCESSED                                =  1798 ;  


// CMMB LOGS :
var LOG_DTV_CMMB_CONTROL_TABLE_UPDATE = 0x14BB ;  
var LOG_DTV_CMMB_MEDIA_BUFFERING_STATUS = 0x14BC ;  
var LOG_DTV_CMMB_CONTROL_EMERGENCY_BCAST= 0x14BD ;   
var LOG_DTV_CMMB_CAS_EMM_ECM = 0x14BE ;  
var LOG_DTV_CMMB_HW_PERFORMANCE= 0x14BF ;  
var LOG_DTV_CMMB_ESG_PROGRAM_INDICATION_INFORMATION= 0x14C0 ;  

// CMMB Arrays
var CMCT_available_services = new Array() ;
var CMCT_multiplexFrameId = new Array();
var SMCT_available_services = new Array();
var SMCT_multiplexFrameId = new Array();





// CMMB Enum Return code

var cmd_api_ctrl_return_code_enum = new Array ("SUCCEEDED" , "NO_RESOURCES" , "SERVICE_NOT_AVAILABLE","NOT_ACTIVATED", "SIGNAL_NOT_FOUND","INFORMATION_NOT_AVAILABLE","NOT_AUTHORIZED","TUNE_FAILURE" ,"NOT_TUNED" , "CAS_CARD_ERROR"  );
var SUCCEEDED             	    = 0 ;   // Indicates success (no error occurred).
var NO_RESOURCES          	    = 1;  // Not enough resources available to fulfill the request.
var SERVICE_NOT_AVAILABLE 	    = 2;  // The desired service is not available.
var NOT_ACTIVATED         	    = 3;  // The request cannot be executed since the stack is not activated.
var SIGNAL_NOT_FOUND      	    = 4;  // No CMMB signal was found on the requested frequency.
var INFORMATION_NOT_AVAILABLE 	= 5;  // Information not available.
var NOT_AUTHORIZED              = 6;  // Service denied by the Conditional Access System
var TUNE_FAILURE                = 7;  // Driver failed to initiate channel acquisition process
var NOT_TUNED                   = 8;  // The request cannot be executed since the modem is not tuned.
var CAS_CARD_ERROR              = 9 ;  // Failure in accessing the CAS card


var CMMB_ctrl = 4 ;
var CMMB_cfg  = 10 ;   

var ctrlRecord = " " + CMMB_ctrl + " "  ; 
var cfgRecord =  " " + CMMB_cfg + " "  ; 

var CMMB_CFG_SET = 1 ; 
var CMMB_CFG_GET = 2 ; 
//CMMB Commands
var CMD_CMMB_DEACTIVATE = 2  ; 
var CMD_CMMB_ACTIVATE = 1  ;
var CMD_CMMB_TUNE= 3  ;
var CMD_CMMB_SELECT_SERVICE= 4  ;
var CMD_CMMB_DE_SELECT_SERVICE= 5  ;
var CMD_CMMB_REQUEST_CA_CARD_NUMBER = 6 ;
var CMD_CMMB_REQUEST_CAS_ID = 7 ;
var CMD_CMMB_GET_SIGNAL_STRENGTH = 8 ;
var CMD_CMMB_START_RECORDING = 9 ;
var CMD_CMMB_STOP_RECORDING = 10 ;

// CMMB Config Item
var CmmbCfgItemsArray = new Array() ;
CmmbCfgItemsArray[0] = "use_hardware_emulator";
CmmbCfgItemsArray[1] = "cmmb_vendor";
CmmbCfgItemsArray[2] = "channel_acquisition_timeout";
CmmbCfgItemsArray[3] = "track_list_acquisition_timeout";
CmmbCfgItemsArray[4] = "video_buffer_size";
CmmbCfgItemsArray[5] = "audio_buffer_size";
CmmbCfgItemsArray[6] = "media_ready_watermark";
CmmbCfgItemsArray[7] = "signal_strength_polling_period";
CmmbCfgItemsArray[8] = "CAS_type" ; 

var IsSyncedEnum = new Array("Not Synced" , "Doing Sync" , "Synced") ;


//CMMB TABELS 
var CMCT = 0 ; 
var SMCT = 1; 
var CSCT  = 2
var SSCT  = 3; 
var NIT = 4 ; 
var BasicDescriptionInformation = 5
var EADT  = 6 ;



// av constants
var AUDIO_OVERFLOW = 0 ; 
var AUDIO_UNDERFLOW  = 1 ; 
var VIDEO_OVERFLOW = 2 ; 
var VIDEO_UNDERFLOW = 3 ; 


//CMMB variables
var VideoOverflowCount=-1;
var AudioOverflowCount=-1;
var  VideoDiscardedUnitsOnOverflow=-1
var  AudioDiscardedUnitsOnOverflow= -1;
var VideoUnderflowCount= -1; 
var AudioUnderflowCount= -1;
var VideoBufferSize = -1;
var VideoBufferDuration= -1;
var AudioBufferSize = -1;
var  AudioBufferDuration = -1;




// CMMB Event 
var IsSync ;
var	SignalStrengthInDbm ;;
var	LDPCErrorRate;

//////////////////////////

// Chord gloabal variables :

var protection_info = new Object();
var	protection_action= new Object();
var	ChOrdStatus = new Object();
var	concurent_tx_info= new Object();
concurent_tx_info.hopping_freq_array= new Array();
concurent_tx_info.hopping_freq_array[0] = 0 ; 
concurent_tx_info.hopping_freq_array[1] = 0 ; 
concurent_tx_info.hopping_freq_array[2] = 0 ; 



/////////// ISDBT Video :
var AV_overflow_happend = false ; 
var AV_underflow_happend = false ; 
var AV_discard_happend= false ; 



var avs_cnt = 0 ; 
var buf_cnt = 0 ; 

var ItemTs = -1; 

var IQXDM2;
var Handle         = 0xFFFFFFFF;
var gMainTickID    = 0;
var UPDATE_MS      = 200;
var PrevIndex      = -1;
var ClientObject ;
var AcqStruct  = new Object() ; 
var RawDataContainer   = new Object() ; 
var periodicGraphData = new Object();
RawDataContainer.firstTime = true;
var userType = "Customer" ; 
var AnnotationId = 0;
var userSelectTechnology = false ; 
var MAX_ROWS = 10000;
var MAX_ENTRIES_FOR_GRAPH = 200;
var MAX_EVENTS = 5000;
var textAnottCnt = 0 ; 
var MAX_ITEMS_PER_UPDATE = 12;
var dummy_ch_idx = 5;
var curr_state_num = -1; 
// Server states
var ServerState; 
var SVR_STATE_CONNECTED     = 2;
var SVR_STATE_REPLAY        = 4;
var STATE                   = "[4]";

var DTV_CMMB_CMD = "CMMB Request";
var DTV_L1_CMD = "DTV/L1 Command Request";
var DTV_L3_CMD = "DTV/L3 Command Request";

var VERSION_INFO_REQ  = "Version Number Request";
var BUILD_ID_REQ      = "Extended Build ID Request";
var BUILD_ID_ITEM_ID      = 124;

var CRM_Build = -1 ; 
var check_FPS_interval_ID ; 

var graph_list = new Array() ; 
var actual_len = -1; 
  var previos_GS = 5; 
var first_time = true ; 
var  LastState = 3; 	

var Fchipx1Hz  =  (64e6)/63 ;
var FftSizeCx1 = -1; 
var FbinHz  = -1 ; 
var Log2AgcSetPointQ6 = 850 ;
var AgcSetPoint = Math.pow( 2 , (Log2AgcSetPointQ6/64) ) ;
var AgcSetPointCfa = AgcSetPoint / 16 ; 


//var QTV_START_FRAMEWORK = "QTV/Framework Start";
var QTV_START_FRAMEWORK = "QTV/Framework Start Request";

//var QTV_STOP_FRAMEWORK  = "QTV/Framework Stop";
var QTV_STOP_FRAMEWORK  = "QTV/Framework Stop Request";

//var QTV_FRAMEWORK_CMD   = "QTV/Framework API Cmd";
var QTV_FRAMEWORK_CMD   = "QTV/Framework API Command Request";

//var EFS2_DIAG_OPEN      = "EFS2/DIAG Open";
var EFS2_DIAG_OPEN      = "EFS2/DIAG Open Request";

//var EFS2_DIAG_CLOSE     = "EFS2/DIAG Close";
var EFS2_DIAG_CLOSE     = "EFS2/DIAG Close Request";

//var EFS2_DIAG_WRITE     = "EFS2/DIAG Write";
var EFS2_DIAG_WRITE     = "EFS2/DIAG Write Request";
var EFS2_DIAG_READ     = "EFS2/DIAG Read Request";
var EFS2_DIAG_STAT     = "EFS2/DIAG Stat Request";


var EFS2_DIAG_UNLINK    = "EFS2/DIAG Unlink Request";

var EFS2_DIAG_OPEN_DIR    = "EFS2/Open Dir Request";
var EFS2_DIAG_MAKE_DIR    = "EFS2/Create Dir Request";

var KEYPRESS = "Emulate Handset Keypress Request";
var DispReq = "Emulate Handset Display Request";

// LOGS
var UBM_L1_LOG_TMCC_C                      = 0x1445	;
var UBM_L1_LOG_CTRL_C                      = 0xA301	;
var UBM_L1_LOG_DATA_RAW_C                  = 0xA302;	
var UBM_L1_LOG_DATA_CRC_C                  = 0xA303;	
var UBM_L1_LOG_TPS_C                       = 0xA304	;
var UBM_L1_LOG_MPE_FEC_MEAS_C              = 0xA305	;
var UBM_L1_LOG_STATUS_C                    = 0xA306;	
var UBM_L1_LOG_CPCE_C                      = 0xA307	;
var UBM_L1_LOG_CPCE_UTIL_PATHLIST_C        = 0xA308	;
var UBM_L1_LOG_CPCE_CAND_PATHLIST_C        = 0xA309	;
var UBM_L1_LOG_CIR_C                       = 0xA30A	;
var UBM_L1_LOG_ACQ_C                       = 0xA30B	;
var UBM_L1_LOG_ACQ_LIKELIHOOD_C            = 0xA30C	;
var UBM_L1_LOG_JAMMER_FFT_OUTPUT_C         = 0xA30D	;
var UBM_L1_LOG_PERIODIC_C                  = 0xA30F	;
var UBM_L1_LOG_DEC_CIR_C                   = 0xA310	;
var UBM_L1_PRBS_ONE_BIT_C                  = 0xA311	;
var UBM_L1_LOG_CONTINUOUS_JAMMER_DETECTION = 0xA312	;
var UBM_L1_DETAIELD_ACQ_LOG                = 0xA313;	
var UBM_L1_LOG_CHORD_STATUS                = 0xA314;	
var UBM_L1_LOG_CHORD_TX_ACTIVITY           = 0xA315;
var UBM_DTV_ISDBT_BUFFERING                = 0x13E7 


//EVENTS
var EVENT_ACQ_DONE            = 1417;	
var EVENT_POWERUP             = 1504;	
var EVENT_POWERDOWN           = 1505 ;	
var EVENT_SOFT_RESET          = 1506	;
var EVENT_STATE_CHANGE        = 1507	;
var EVENT_ACQ_TUNE_STATUS     = 1508	;
var EVENT_ACQ_DONE_STATUS     = 1509	;
var EVENT_TRAFFIC_STARTED     = 1511	;
var EVENT_DTV_L1_BAD_FRAME_RECEIVED  = 1512;	
var EVENT_DTV_L1_TMCC_FAILURE        = 1513	;
var EVENT_DTV_L1_RECOVERY_STATUS     = 1514;	
var EVENT_DTV_L1_L3_API_COMMAND      = 1516	;
var EVENT_DTV_L1_MODEM_FAILURE       = 1517	;

var EVENT_DTV_ISDB_ACTIVATE                    = 1520 ; 
var EVENT_DTV_ISDB_DEACTIVATE                  = 1521 ; 
var EVENT_DTV_ISDB_TUNE                        = 1522 ; 
var EVENT_DTV_ISDB_UNTUNE                      = 1523 ; 
var EVENT_DTV_ISDB_SELECT_SERVICE              = 1524 ; 
var EVENT_DTV_ISDB_SERVICE_AVAILABLE           = 1525 ; 
var EVENT_DTV_ISDB_TRAFFIC_LOST                = 1526 ; 
var EVENT_DTV_ISDB_TABLE_UPDATE                = 1527
var EVENT_DTV_ISDB_TRACKS_SELECTED             = 1528; 
var EVENT_DTV_ISDB_PES_BUFFER_OVERFLOW         = 1529 ; 
var EVENT_DTV_ISDB_PES_BUFFER_UNDERFLOW        = 1530 ; 
var EVENT_DTV_ISDB_ACQUIRE_DATA_COMPONENT      = 1531 ; 
var EVENT_DTV_ISDB_STOP_COMPONENT_ACQUISITION  = 1532 ; 
var EVENT_DTV_ISDB_DII_CHANGED                 = 1533 ; 
var EVENT_DTV_ISDB_DATA_EVENT_MESSAGE          = 1534 ; 
var EVENT_DTV_ISDB_MODULE_CONSTRUCTION         = 1535 ; 
var EVENT_DTV_ISDB_PARSING_ERROR               = 1536 ; 


var EVENT_MBP_RF_ANALOG_JD_MODE_CHANGE  = 1622 ; 
var EVENT_MBP_RF_ANALOG_JD_INT          = 1623 ; 



// Commands
var UBM_L1_ACQ_CMD                                = 100;
var UBM_L1_ISDB_RESET_CMD                         = 101; 
var UBM_L1_POWERUP_CMD                            = 103;
var UBM_L1_POWERDOWN_CMD                          = 104;
var UBM_L1_ISDB_RECORD_TSIF_PACKETS_CMD           = 107 ; 
var UBM_L1_ISDB_PRBS_ONE_BIT_CMD                  = 109;

var UBM_L1_ISDB_ENABLE_LNA_UPDATE_CMD             = 111 ;  
var UBM_L1_ISDB_DISABLE_LNA_UPDATE_CMD            = 112 ;  
var UBM_L1_ISDB_RSSI_STATUS_CMD                   = 114 ; 
var UBM_L1_ISDB_CFG_RDSP_LOG_CMD                  = 116 ; 
var UBM_L1_ISDB_SET_LNA_CMD                       = 119 ; 
var UBM_L1_CFG_ITEM                               = 125;
var UBM_L1_ISDB_PEEK_POKE_CMD                     = 126 ; 
var UBM_L1_ISDB_RESET_PKT_TRASH_COUNTERS_CMD      = 127 ;
var UBM_L1_RESET_COUNTERS_CMD                     = 130 ;
var UBM_L1_ISDB_LOG_ACQ_CMD                       = 133 ;  
var UBM_L1_ISDB_GET_CURRENT_STATE_CMD             = 137 ; 
var UBM_L1_ISDB_GET_VERSION_INFO_CMD              = 139 ; 
var UBM_L1_ISDB_DIAG_HANDLE_TRACK_LOOPS_CFG_CMD   = 143 ; 
var UBM_L1_ISDB_DIAG_GET_TRACK_LOOPS_STATUS_CMD   = 144 ; 

var UBM_L1_ISDB_DIAG_SET_DC_LOOPS_GAIN_CMD        =145 ;
var UBM_L1_ISDB_GET_DC_GAINS_CMD                  = 146 ; 

var TestStartTime;
var CurrentTimestamp;
var TestRunning = false;

var gEnumModulation = new Array();
gEnumModulation[7] = "N/A";
gEnumModulation[0] = "DQPSK";
gEnumModulation[1] = "QPSK";
gEnumModulation[2] = "16QAM" ;
gEnumModulation[3] = "64 QAM";


var gModeEnum = new Array();
gModeEnum[0] = "N/A";
gModeEnum[1] = "Mode 1";
gModeEnum[2] = "Mode 2";
gModeEnum[3] = "Mode 3"

var gGuardEnum = new Array();
gGuardEnum[0] = "1/4";
gGuardEnum[1] = "1/8";
gGuardEnum[2] = "1/16";
gGuardEnum[3] = "1/32";


var TRAFFIC_STATE = 4;

var StatesNamesEnum = new Array();
StatesNamesEnum[0] = "INIT";
StatesNamesEnum[1] = "IDLE";
StatesNamesEnum[2] = "ACQ_TUNE";
StatesNamesEnum[3] = "ACQUISITION";
StatesNamesEnum[4] = "TRAFFIC";
StatesNamesEnum[5] = "SOFT_RECOVERY";
StatesNamesEnum[6] = "SR_TRAFFIC";
StatesNamesEnum[7] = "HR_RESET";
StatesNamesEnum[8] = "HR_IDLE";
StatesNamesEnum[9] = "HR_ACQ_TUNE";
StatesNamesEnum[10] = "HR_ACQUISITION";
StatesNamesEnum[11] = "HR_TRAFFIC";

StatesNamesEnum[102] = "GUI_ON_LOAD";
StatesNamesEnum[100] = "GUI_REGISTRATION";
StatesNamesEnum[101] = "GUI_NOT_CONNECTED";





var code_rate_Enum = new Array();
code_rate_Enum[0] = 1/2;
code_rate_Enum[1] = 2/3;
code_rate_Enum[2] = 3/4;
code_rate_Enum[3] = 5/6;
code_rate_Enum[4] = 7/8;


var code_rate_str_Enum = new Array();
code_rate_str_Enum[0] = "1/2";
code_rate_str_Enum[1] = "2/3";
code_rate_str_Enum[2] = "3/4";
code_rate_str_Enum[3] = "5/6";
code_rate_str_Enum[4] = "7/8";



var DVBHEventTable = "<table width=\"100%\" id=\"EventMarkersDVBH\" cellSpacing=\"0\" cellPadding=\"0\" border=\"0\">" ; 
  DVBHEventTable+= "<colgroup span=\"3\">" ; 
  DVBHEventTable+="<col width=\"33%\">"; 
DVBHEventTable+="<col width=\"33%\">";
DVBHEventTable+="<col width=\"33%\">";
DVBHEventTable+="</colgroup>";
DVBHEventTable+="<tr>";
DVBHEventTable+="<td><input type=\"checkbox\" value=\"snooze\" name=\"eventListSnooze\" ID=\"Checkbox1\"> <font color='Aqua'>Snooze</font></td>";
DVBHEventTable+="<td><input type=\"checkbox\" value=\"L1AcqSuccess\" name=\"eventListL1AcqSuccess\" ID=\"Checkbox2\"><font color='Yellow'>L1 Acquisition Success</font></td>";
DVBHEventTable+="<td><input type=\"checkbox\" value=\"Signal lost\" name=\"eventListSignalLost\" ID=\"Checkbox3\"><font color='Purple'>Signal Lost</font></td></tr>";
DVBHEventTable+="<tr><td><input type=\"checkbox\" value=\"online\" name=\"eventListOnline\" ID=\"Checkbox4\"> <font color='Blue'>Online</font></td>";
DVBHEventTable+="<td><input type=\"checkbox\" value=\"TableAcqSuccess\" name=\"eventListTableAcqSuccess\" ID=\"Checkbox5\"><font color='Green'>Table Acquisition Success</font></td>";
DVBHEventTable+="<td><input type=\"checkbox\" value=\"CEStateChange\" name=\"eventListCEStateChange\" ID=\"Checkbox6\"><font color='Fuchsia'>L3 CE State Change</font></td></tr>";
DVBHEventTable+="<tr><td><input type=\"checkbox\" value=\"sleep\" name=\"eventListSleep\" ID=\"Checkbox7\"><font color='Teal'>Sleep</font></td>";
DVBHEventTable+="<td><input type=\"checkbox\" value=\"PlatformAcqSucess\" name=\"eventListPlatformAcqSuccess\" ID=\"Checkbox8\"><font color='Lime'>Platform Acquisition Success</font></td>";
DVBHEventTable+="<td><input type=\"checkbox\" value=\"L3InitSuccess\" name=\"eventListL3InitSuccess\" ID=\"Checkbox9\"><font color='Maroon'>L3 Init Success</font></td>";
DVBHEventTable+="</tr></table>";


var ISDBTEventTable = "<table width=\"100%\" id=\"EventMarkersISDBT\" cellSpacing=\"0\" cellPadding=\"0\" border=\"0\">";
ISDBTEventTable += "<colgroup span=\"3\">";
ISDBTEventTable += "<col width=\"12.5%\">";
ISDBTEventTable += "<col width=\"12.5%\">";
ISDBTEventTable += "<col width=\"12.5%\">";
ISDBTEventTable += "<col width=\"12.5%\">";
ISDBTEventTable += "<col width=\"12.5%\">";
ISDBTEventTable += "<col width=\"12.5%\">";
ISDBTEventTable += "<col width=\"12.5%\">";
ISDBTEventTable += "<col width=\"12.5%\">";
ISDBTEventTable += "</colgroup>";

ISDBTEventTable += "<tr>";

ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L1_POWERUP\" NAME=\"EVENT_DTV_L1_POWERUP\"> <font color=\"yellow\">	L1 POWER-UP</font></td>";
//ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"RF_TUNE_SUCCESS\" NAME=\"RF_TUNE_SUCCESS\"><font color=\"orange\">RF Tune Success</font></td>";
//ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"L1_ACQ_SUCCESS\" NAME=\"L1_ACQ_SUCCESS\"><font color=\"Turquoise\">L1	ACQ Success</font></td>";
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"L1_ENTER_RECOVERY\" NAME=\"L1_ENTER_RECOVERy\"><font color=\"#99cc66\">Enter Recovery</font></td>";
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L1_POWERDOWN\" NAME=\"EVENT_DTV_L1_POWERDOWN\"><font color=\"brown\">L1 POWER DOWN</font></td>";
//ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"RF_TUNE_FAIL\" NAME=\"RF_TUNE_FAIL\"><font color=\"plum\">RF Tune Failed</font></td>";
//ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"L1_ACQ_FAILED\" NAME=\"L1_ACQ_FAILED\"><font color=\"blue\">L1 ACQ Failed</font></td>";
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"TRAFFIC_STARTED\" NAME=\"TRAFFIC_STARTED\"><font color=\"#33be99\">Traffic Started</font></td>";
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L1_SOFT_RESET\" NAME=\"EVENT_DTV_L1_SOFT_RESET\"><font color=\"tan\">L1 SOFT RESET</font></td>";
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"BAD_FRAME_RECEIVED\" NAME=\"BAD_FRAME_RECEIVED\"><font color=\RED >Bad Frame Received</font></td>";
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"L1TMCC_FAILURE\" NAME=\"L1TMCC_FAILURE\"><font color=\"#cc99ff\">L1 TMCC_FAILURE</font></td>"; 
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L1_MODEM_FAILURE\" NAME=\"EVENT_DTV_L1_MODEM_FAILURE\"><font color=\"Indigo\">L1 MODEM FAILURE</font></td>"; 

ISDBTEventTable += "</tr><tr>";
    
  


//ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L1_STATE_CHANGE\" NAME=\"EVENT_DTV_L1_STATE_CHANGE\"> <font color=\"#ff00ff\">L1 STATE CHANGE</font></td>";
//ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"L3L1Interface\" NAME=\"L3L1Interface\"><font color=\"#cc99ff\">L3-L1 Interface</font></td>"; 
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L3_L1_POWERUP_CMD\" NAME=\"EVENT_DTV_L3_L1_POWERUP_CMD\"><font color=\"orange\">L3->L1 POWER-UP CMD</font></td>"
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L3_L1_POWERDOWN_CMD\" NAME=\"EVENT_DTV_L3_L1_POWERDOWN_CMD\"><font color=\"Pink\">L3->L1:POWER-DOWN CMD</font></td>"
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L3_L1_ACQ_CMD\" NAME=\"EVENT_DTV_L3_L1_ACQ_CMD\"><font color=\"Aqua\">L3->L1 ACQ CMD</font></td>"
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L1_L3_TRAFFIC_ON_NOTIFY\" NAME=\"EVENT_DTV_L1_L3_TRAFFIC_ON_NOTIFY\"><font color=\"Teal\">L1->L3:Traffic ON notify</font></td>"
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L1_L3_TRAFFIC_LOST_NOTIFY\" NAME=\"EVENT_DTV_L1_L3_TRAFFIC_LOST_NOTIFY\"><font color=\"HTML_DARK_BLUE\">L1->L3: Traffic LOST notify</font></td>";
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L1_L3_ACQ_SUCCESS\" NAME=\"EVENT_DTV_L1_L3_ACQ_SUCCESS\"><font color = \"Gold\">L1->L3 ACQ SUCCESS</font></td>";
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_DTV_L1_L3_ACQ_FAILURE\" NAME=\"EVENT_DTV_L1_L3_ACQ_FAILURE\"> <font color=\"White\">L1->L3 ACQ Failure</font></td>";

ISDBTEventTable += "</tr>";


ISDBTEventTable += "<tr>";
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"RF_ANALOG_JD_MODE_CHANGE\" NAME=\"RF_ANALOG_JD_MODE_CHANGE\"><font color=\"\gray\">Analog Jammer Detector Mode Change</font></td>"
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"EVENT_MBP_RF_ANALOG_JD_INT\" NAME=\"EVENT_MBP_RF_ANALOG_JD_INT\"><font color=\"blue\">Analog Jammer Detector Polling</font></td>"
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"_\" NAME=\"_\"><font color=\"#cc99ff\">_</font></td>"
ISDBTEventTable += "<td><input type=\"checkbox\" ID=\"_\" NAME=\"_\"><font color=\"#cc99ff\">_</font></td>"
ISDBTEventTable += "</tr>";

ISDBTEventTable += "</table>";


var eventTableHeader ="<button type=\"submit\" title=\"SelectAll\" onclick=\"       onclickMarkAllEvent()  \" ID=\"Button3\" >Mark All Events</button> " ;
eventTableHeader    +="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; " ;
eventTableHeader    +="<button type=\"submit\" title=\"onRemoveAll()\" onclick=\"onRemoveAll()\" ID=\"Button4\" >Remove All</button>" ;
eventTableHeader    +="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ";
eventTableHeader    +="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ";
eventTableHeader    +="<button id=\"Button5\" title=\"Zoom Out\" onclick=\"onClickZoomOut()\" type=\"submit\">--&gt; Zoom Out &lt;--</button>" ;
eventTableHeader    +="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ";
eventTableHeader    += "<button type=\"submit\" title=\"Zoom In\" onclick=\"onClickZoomIn()\" ID=\"Button6\">&lt;-- Zoom In --&gt; </button>"; 



var CMMBEventTable = "<table width=\"100%\" id=\"EventMarkersCMMB\" cellSpacing=\"0\" cellPadding=\"0\" border=\"0\">";
CMMBEventTable += "<colgroup span=\"3\">";
CMMBEventTable += "<col width=\"16.6%\">";
CMMBEventTable += "<col width=\"16.6%\">";
CMMBEventTable += "<col width=\"16.6%\">";
CMMBEventTable += "<col width=\"16.6%\">";
CMMBEventTable += "<col width=\"16.6%\">";
CMMBEventTable += "<col width=\"16.6%\">";

CMMBEventTable += "</colgroup>";

CMMBEventTable += "<tr>";

CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_CALL_ACTIVATE\"> <font color=\"brown\">Call Activate</font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_CALL_DEACTIVATE\"><font color=\"brown\">Call DeActivate</font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_NOTIFICATION_ACTIVATE\" ><font color=\"brown\">Notif' Activate</font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_NOTIFICATION_DEACTIVATE\" ><font color=\"brown\">Notif' De-Activate</font></td>";

CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_CALL_TUNE\"><font color=\"orange\">Call Tune</font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_NOTIFICATION_TUNE\" ><font color=\"orange\">Notif' Tune</font></td>";

CMMBEventTable += "</tr><tr>";

CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_CALL_SELECT_SERVICE\"><font color=\"green\">Call Select Service</font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_CALL_DESELECT_SERVICE\"><font color=\"green\">Call De-Select Service</font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_NOTIFICATION_SELECT_SERVICE\" ><font color=\"green\">Notif' Select Service</font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_NOTIFICATION_DESELECT_SERVICE\" ><font color=\"green\">Notif' De-Select Service</font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_NOTIFICATION_AUTHORIZATION_FAILURE\" ><font color=\"White\">Notif' Authorization Failure</font></td>";
CMMBEventTable += "</tr><tr>";


CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_NOTIFICATION_EMERGENCY_BROADCASTING_TRIGGER\" ><font color=\"Teal\">Notif' Emergency Trigger </font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_NOTIFICATION_EMERGENCY_BROADCASTING_MSG\" ><font color=\"Teal\">Notif' Emergency Msg</font></td>";


CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_CAS_INITIALIZED\" ><font color=\"Turquoise\">CAS Initialized </font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_CAS_EMM_RECEIVED\" ><font color=\"#cc99ff\">CAS EMM Received</font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_CAS_ECM_RECEIVED\" ><font color=\"HTML_DARK_BLUE\">CAS ECM Received</font></td>";

CMMBEventTable += "</tr><tr>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_AUDIO_OVERFLOW\" ><font color=\"red\">Audio OverFlow </font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_AUDIO_UNDERFLOW\" ><font color=\"red\">Audio UnderFlow </font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_VIDEO_OVERFLOW\" ><font color=\"blue\">Video OverFlow </font></td>";
CMMBEventTable += "<td><input type=\"checkbox\" ID=\"cb_VIDEO_UNDERFLOW\" ><font color=\"blue\">Video UnderFlow </font></td>";

CMMBEventTable += "</tr>";

CMMBEventTable += "</table>";


///////////////////////////////////////////
/////       GLOBALS                ///////
///////////////////////////////////////////
var TIMEOUT_MS      = 500;
var ITEM_TYPE_DIAG_RX = 1 ; 
var ITEM_TYPE_EVENT = 4 ; 
var ITEM_TYPE_LOG   = 5 ;
var ITEM_TYPE_MSG = 6 ;
 var ITEM_TYPE_STRING = 7; 
var ITEM_TYPE_RESPONSE = 9 ; 

//////////////////////////////////////////
// global IO-COMP COLORS  :
//////////////////////////////////////////
var BLUE = 16711680 ; 
var RED = 255 ;
var GREEN  = 32768 ; 
var BRIGHT_GREEN = 65280 ;  
var WHITE = 16777215 ; 
var ROSE  = 13408767;
var DARK_BLUE  = 65535 ; 
var YELLOW = 65535;
var DARK_RED  = 128 ; 
var PINK  = 16711935;
var BROWN =13209
var ORENGE =26367;
var LIGHT_ORENGE = 39423;
var GOLD = 52479;
var TAN =10079487;
var OLIVE_GREEN =13107;
var DARK_YELLOW =32896;
var LIME =52377;
var LIGHT_YELLO= 10092543;
var DARK_GREEN =13056;
var SEA_GREEN =6723891;
var LIGHT_GREEN = 13434828;
var TEAL = 8421376;
var AQUA =13421619;
var TURQUOISE= 16776960;
var LIGHT_TURQUOISE = 16777164;
var LIGHT_BLUE=16737843;
var SKY_BLUE=16763904;
var PALE_BLUE =16764057;
var INDIGO =10040115
var BLUE_GRAY =10053222;
var VIOLET =8388736;
var PLUM=6697881;
var LAVENDER  =16751052;
var HTML_DARK_BLUE=32768 ;
var GRAY =10000000;
var BLACK = 0 ; 
var LIGHT_PURPLE = 0xcc99ff;
//////////////////////////////////////////
var LINEAR = 0 ; 
var LOGARITMIC = 1 ; 

//////////////////////////////////////////
// global IO-COMP LineTypes  :
//////////////////////////////////////////
var DOTS = 2 ; 
var SOLID = 0 ;
var DASH = 1 ;
// TODO add more... 
//////////////////////////////////////////

//////////////////////////////////////////
// global IO-COMP TrackingStyle  :
//////////////////////////////////////////
var iptsExpandCollapse= 5; //
var iptfDateTime = 3 ;
var iptfExponent = 1  ; 
var iptfLinear = 0  ; 
// TODO add more...
////////////////////////////////////////
var dc_wu_cnt = -15 ; 
var firstTime = true ; 
//////////////////////////////////////////
// global L1 - ICD   :
//////////////////////////////////////////
var SIGNAL_QUALITY_SBPKT_ID = 8 ; 
var TRACKING_LOOP_SBPKT_ID = 9 ;
var STATUS_SBPKT_ID = 10 ;
var MEAS_INFO_SBPKT_ID = 11 ;
var CIR_SBPKT_ID = 15 ; 
var AGC_SBPKT_ID = 16 ;  
var CTA_SBPKT_ID = 17 ;  
var CFA_SBPKT_ID = 18 ; 
var CFB_SBPKT_ID = 19 ;
var ACQ_LIKELIHOOD_SBPKT_ID = 20 ;
var JAM_FFT_OUTPUT_SBPKT_ID = 21 ;
var PERIODIC_SBPKT_ID = 23 ;

var CJD_SBPKT_ID = 27 ;
var RF_DATA_SBPKT_ID = 28 ;
var DETAILED_ACQ_SBPKT_ID = 29 ;
var TMCC_SBPKT_ID = 100 ;
var DOPPLER_SBPKT_ID = 101 ;
//////////////////////////////////////// 

//////////////////////////////////////// 
var ACQ_State_DC_WU = 0 ; 
var ACQ_State_AGC_WU =1 ; 
var ACQ_State_JD = 2 ; 
var ACQ_State_REST = 3 ; 

var base_time = 0 ;
var requestCount = 1 ; 
var bValuesOnly = 1 ; 

var ver1 = 1; 
var ver2 = 2;
var ver3 = 3;
var ver4 = 4;
var ver5 = 5;
var ver6 = 6;
var selectedTechnology = "" ; 

//////////////////////////////////////////
// global L1 - ICD NumOfFields   :
////////////////////////////////////////// 
var NumOfIDs = 101; 
var L1NumOfFieldsById  = new Array(6); // version 1 2 3 4  
L1NumOfFieldsById[1] = new Array(NumOfIDs) ; 
L1NumOfFieldsById[2] = new Array(NumOfIDs) ;
L1NumOfFieldsById[3] = new Array(NumOfIDs) ;   
L1NumOfFieldsById[4] = new Array(NumOfIDs) ;   
L1NumOfFieldsById[5] = new Array(NumOfIDs) ;   
L1NumOfFieldsById[6] = new Array(NumOfIDs) ;   
L1NumOfFieldsById[7] = new Array(NumOfIDs) ;   
L1NumOfFieldsById[8] = new Array(NumOfIDs) ;   



// TODO it might be depend also the technology ISDBT /DVBH  
L1NumOfFieldsById[ver1][SIGNAL_QUALITY_SBPKT_ID] = 5  + 4 ;  
L1NumOfFieldsById[ver2][SIGNAL_QUALITY_SBPKT_ID] = 15  + 4 ; 
L1NumOfFieldsById[ver3][SIGNAL_QUALITY_SBPKT_ID] = 15  + 4  + 3;  
L1NumOfFieldsById[ver4][SIGNAL_QUALITY_SBPKT_ID] = 15  + 4 +3 + 8 ; 

 
L1NumOfFieldsById[ver1][TRACKING_LOOP_SBPKT_ID] = 12 + 4 ; 
L1NumOfFieldsById[ver2][TRACKING_LOOP_SBPKT_ID] = 16 + 4 ; 
L1NumOfFieldsById[ver3][TRACKING_LOOP_SBPKT_ID] = 16 + 4 ; 
L1NumOfFieldsById[ver4][TRACKING_LOOP_SBPKT_ID] = 16 + 4 ; 

L1NumOfFieldsById[ver1][STATUS_SBPKT_ID] = 5+ 4  ; 
L1NumOfFieldsById[ver2][STATUS_SBPKT_ID] = 7 + 4  ; 
L1NumOfFieldsById[ver3][STATUS_SBPKT_ID] = 9 + 4  ; 
L1NumOfFieldsById[ver4][STATUS_SBPKT_ID] = 13 + 4  ; 

L1NumOfFieldsById[ver1][MEAS_INFO_SBPKT_ID] = 8 + 4 ; 
L1NumOfFieldsById[ver2][MEAS_INFO_SBPKT_ID] = 8 + 4 ; 
L1NumOfFieldsById[ver3][MEAS_INFO_SBPKT_ID] = 8 + 4 ; 
L1NumOfFieldsById[ver4][MEAS_INFO_SBPKT_ID] = 8 + 4 ; 

L1NumOfFieldsById[ver1][CIR_SBPKT_ID] = 10 + 4 ;  
L1NumOfFieldsById[ver2][CIR_SBPKT_ID] = 10 + 4 ;  
L1NumOfFieldsById[ver3][CIR_SBPKT_ID] = 10 + 4 ;  
L1NumOfFieldsById[ver4][CIR_SBPKT_ID] = 10 + 4 ;  

var N= 6 ; //N = 6, Number of notch filters
L1NumOfFieldsById[ver1][AGC_SBPKT_ID] = 7 + 4*N + 4 ;  
L1NumOfFieldsById[ver2][AGC_SBPKT_ID] = 7 + 4*N + 4 ;   
L1NumOfFieldsById[ver3][AGC_SBPKT_ID] = 10 + 4*N + 4 ;  
L1NumOfFieldsById[ver4][AGC_SBPKT_ID] = 10 + 4*N + 6 ;  
L1NumOfFieldsById[ver5][AGC_SBPKT_ID] = 10 + 4*N + 12 ;  
L1NumOfFieldsById[ver6][AGC_SBPKT_ID] = 10 + 4*N + 12 + 4  ;

L1NumOfFieldsById[ver1][CTA_SBPKT_ID] = 20 + 4 ; 
L1NumOfFieldsById[ver2][CTA_SBPKT_ID] = 20 + 4 ; 
L1NumOfFieldsById[ver3][CTA_SBPKT_ID] = 20 + 4 ;  
L1NumOfFieldsById[ver4][CTA_SBPKT_ID] = 20 + 4 ; 
 
 
L1NumOfFieldsById[ver1][CFA_SBPKT_ID] = 2 + 4 ;     
L1NumOfFieldsById[ver2][CFA_SBPKT_ID] = 10;    
L1NumOfFieldsById[ver3][CFA_SBPKT_ID] = 10;    
L1NumOfFieldsById[ver4][CFA_SBPKT_ID] = 10;    


L1NumOfFieldsById[ver1][CFB_SBPKT_ID] = 5 + 4  ; 
L1NumOfFieldsById[ver2][CFB_SBPKT_ID] = 6 + 4  ; 
L1NumOfFieldsById[ver3][CFB_SBPKT_ID] = 6 + 4  ; 
L1NumOfFieldsById[ver4][CFB_SBPKT_ID] = 6 + 4  ; 

L1NumOfFieldsById[ver1][ACQ_LIKELIHOOD_SBPKT_ID] = 11 + 4 ;   
L1NumOfFieldsById[ver2][ACQ_LIKELIHOOD_SBPKT_ID] = 11 + 4 ;   
L1NumOfFieldsById[ver3][ACQ_LIKELIHOOD_SBPKT_ID] = 11 + 4 ;   
L1NumOfFieldsById[ver4][ACQ_LIKELIHOOD_SBPKT_ID] = 11 + 4 ;   
 
 L1NumOfFieldsById[ver1][JAM_FFT_OUTPUT_SBPKT_ID] = 4 + 4 ;   
L1NumOfFieldsById[ver2][JAM_FFT_OUTPUT_SBPKT_ID] = 4 + 4 ;   
L1NumOfFieldsById[ver3][JAM_FFT_OUTPUT_SBPKT_ID] = 4 + 4 ;   
L1NumOfFieldsById[ver4][JAM_FFT_OUTPUT_SBPKT_ID] = 4 + 4 ;   

L1NumOfFieldsById[ver1][PERIODIC_SBPKT_ID] = 4 + 4 ;   
L1NumOfFieldsById[ver2][PERIODIC_SBPKT_ID] = 4 + 4 ;   
L1NumOfFieldsById[ver3][PERIODIC_SBPKT_ID] = 4 + 4 ;   
L1NumOfFieldsById[ver4][PERIODIC_SBPKT_ID] = 4 + 4 ;




L1NumOfFieldsById[ver1][CJD_SBPKT_ID] = 12 + 4 ;   
L1NumOfFieldsById[ver2][CJD_SBPKT_ID] = 12 + 4 ;   
L1NumOfFieldsById[ver3][CJD_SBPKT_ID] = 12 + 4 ;   
L1NumOfFieldsById[ver4][CJD_SBPKT_ID] = 12 + 4 ;   

L1NumOfFieldsById[ver1][RF_DATA_SBPKT_ID] = 63 + 4 ;   
L1NumOfFieldsById[ver2][RF_DATA_SBPKT_ID] = 63 + 15 + 11 ;   
L1NumOfFieldsById[ver3][RF_DATA_SBPKT_ID] = 63 + 4 + 11;   
L1NumOfFieldsById[ver4][RF_DATA_SBPKT_ID] = 63 + 4 + 11;   
 
L1NumOfFieldsById[ver1][DETAILED_ACQ_SBPKT_ID] = 11 + 4 ;   
L1NumOfFieldsById[ver2][DETAILED_ACQ_SBPKT_ID] = 11 + 4 ;   
L1NumOfFieldsById[ver3][DETAILED_ACQ_SBPKT_ID] = 11 + 4 ;   
L1NumOfFieldsById[ver4][DETAILED_ACQ_SBPKT_ID] = 11 + 4 ;   

L1NumOfFieldsById[ver1][TMCC_SBPKT_ID] = 4 + 4 ; 
L1NumOfFieldsById[ver2][TMCC_SBPKT_ID] = 4 + 4 ; 
L1NumOfFieldsById[ver3][TMCC_SBPKT_ID] = 4 + 4 ; 
L1NumOfFieldsById[ver4][TMCC_SBPKT_ID] = 4 + 4 ; 

L1NumOfFieldsById[ver1][DOPPLER_SBPKT_ID] = 4 + 4 ; 
L1NumOfFieldsById[ver2][DOPPLER_SBPKT_ID] = 4 + 4 ; 
L1NumOfFieldsById[ver3][DOPPLER_SBPKT_ID] = 4 + 4 ; 
L1NumOfFieldsById[ver4][DOPPLER_SBPKT_ID] = 4 + 4 ; 

////////////////////////////////////////////////////////////////////////////////////////////


function  AllocateAllArrays(){
 RawDataContainer.XaxisData       = new Array (1024); 
 RawDataContainer.GainState       = new Array (1024); 
RawDataContainer.log2EeDvgaInp   = new Array (1024); 
RawDataContainer.log2EeDvgaGain = new Array (1024);
RawDataContainer.JdMode          = new Array (1024);
RawDataContainer.fft_out_I      = new Array (1024); 
RawDataContainer.fft_out_Q      = new Array (1024); 
RawDataContainer.ChEst_I        = new Array (1024); 
RawDataContainer.ChEst_Q        = new Array (1024); 

periodicGraphData.ConstPointI     = new Array( 1024) ; 
periodicGraphData.ConstPointQ   = new Array( 1024) ; 
periodicGraphData.status_rssi                = new Array( 1024) ; 

periodicGraphData.curr_GainIncerThDb    = new Array( 1024) ; 
periodicGraphData.curr_GainDecrThDb     = new Array( 1024) ; 
periodicGraphData.JdMode                = new Array( 1024) ; 
periodicGraphData.FFTAmplitude       = new Array(1024) ; 
periodicGraphData.FFTPhase           = new Array( 1024) ; 
periodicGraphData.ChEstAmplitude     = new Array( 1024) ; 
periodicGraphData.ChEstPhase         = new Array( 1024) ;

RawDataContainer.CoarseDC_I             = new Array(1024) ; 
RawDataContainer.CoarseDC_Q             = new Array(1024) ; 
RawDataContainer.FineDC_Q               = new Array(1024) ; 
RawDataContainer.FineDC_I               = new Array(1024) ; 


 periodicGraphData.DvgaGainDb     = new Array( 1024) ; 
periodicGraphData.DvgaOutPwrDb   = new Array( 1024) ;
RawDataContainer.Log2DvgaGain      = new Array (1024); 
RawDataContainer.Log2Ee          = new Array (1024);  
RawDataContainer.zfce            = new Array (1024);
}


Enable_Disable_Button_State = 0 ; 
var TenDivLog2Of10 = (10/log2(10)) ; 
var gNumToAnd = new Array();
for(var i = 0; i < 32; i++)
{
	gNumToAnd[i] = Math.pow(2,i)
}
////////////////////////////////////////////////////////////////////////////////////////////

function ProcessItems()
{  

   var CurrIndex = IQXDM2.GetClientItemCount( Handle ) - 1;
   if (PrevIndex > CurrIndex)   //which means that items were cleared
   {
			// Reset index if it is greater than item count
			PrevIndex = -1;
			InitDisplay() ; 	
   }

   // Make sure there is a new item
   if (CurrIndex < 0 || CurrIndex == PrevIndex) {     return;   }

       
   for (var i = PrevIndex + 1; i <= CurrIndex; i++)
   {
      var Item = IQXDM2.GetClientItem( Handle, i );
  
	  if (Item == null || ( Item.GetItemType() != ITEM_TYPE_STRING &&  Item.GetItemFields() == null) ) continue;  
	
	switch( Item.GetItemType() )
      {
  
         case ITEM_TYPE_DIAG_RX:
           ProcessDIAG( Item );
           break;
         
         case ITEM_TYPE_EVENT:
           ProcessEvents( Item );
           break;
         case ITEM_TYPE_LOG: 
           ProcessLogs( Item  );
           break;
         case ITEM_TYPE_MSG:
  
           ProcessMessages( Item );
           break;
         case ITEM_TYPE_STRING:
           ProcessStrings( Item );
           break;
         case 8:
           //OTA logs are ignored
           break;
         case ITEM_TYPE_RESPONSE: 
  	  
           ProcessSubsystemResponses( Item );
           break;
         case 10:
           ProcessSubsystemRequests( Item );
           break;
         default:
           //DebugMessageProcessItems( "Cannot handle type " + Item.GetItemType() );
           break;
      }
		
	   
    }// close for loop over items buff     
     
   PrevIndex = CurrIndex;
   // Update the timer


}// close function 
//////////////////////////////////////////////////////////

////  SendRequest( "Emulate Handset Display Request", 0 );
/////////////////////////////////////////////////////////////////////////////////////////////

 function CreateDummyChannel(graph)
   {
   // Add channel just so the graph will move incase there are events but no logs.  This channel supposed to be invisible       
   graph.Channel(dummy_ch_idx).RingBufferSize = 1000;
   graph.Channel(dummy_ch_idx).MarkersVisible = false;
   graph.Channel(dummy_ch_idx).TraceVisible = false;
   graph.Channel(dummy_ch_idx).VisibleInLegend = false;
	graph.Channel(dummy_ch_idx).VisibleInLegend = false;  
   }
  
   
function  CreateGraphChannels(graph)
{
	for (var k = 0 ; k< dummy_ch_idx ; k++)
	{
	graph.AddChannel();
	graph.Channel(k).VisibleInLegend = false;  
	}
	graph.AddChannel();
	CreateDummyChannel(graph) ; 
}  
   //////////////////////////////////////////////////////////////////


function Register()
{   
        
   curr_state_num = 102 ; 
  
   IQXDM2 = window.external;
    
   if (IQXDM2 == null)
   {
      window.document.write( "QXDM does not support required interface" );
     curr_state_num = 101 ; 
      return;
   }
   
 
 
   ServerState = IQXDM2.GetServerState(); 
   if (ServerState != SVR_STATE_CONNECTED) 
   {
     curr_state_num = 101 ; 
	 alert("Pay attention ! QXDM is Not Connected.\nYou can keep working Off-Line but some of the views will not have thier relevant data" ); 
     //return ;  
   } else{
      curr_state_num = 100 ;
   }
    
    RegisterToQXDM() ;
    
     InitDisplay();    
  
  
}// close function register
////////////////////////////////////////////////////////////////////////////////////////////////////////////
function RegisterToQXDM()
{
	// We start by registering as a client
	Handle = IQXDM2.RegisterClient( "", 0 );
	if (Handle == 0xFFFFFFFF)
	{
		window.document.write( "<br />Unable to register as client" );
		return false ;
	}   

	// Get a configuration object
	ClientObject = IQXDM2.ConfigureClientByKeys( Handle );
	if (ClientObject == null)
	{
		window.document.write( "<br />Failed to get client interface pointer" );
		return false;
	}

	 RegisterSpecificViewItems();   
     AllocateAllArrays();

	// Setup the main update timer
	gMainTickID = setInterval( 'ProcessItems()', UPDATE_MS );
    return true; 
}

// Clean up on unloading the page
function Unregister()
{
 
   UnRegisterSpecificPerView() ; 
    IQXDM2.ClearClientItems(Handle) ;
   if (gMainTickID != 0)
   {
      window.clearInterval( gMainTickID );
      gMainTickID = 0;
   }

   if (Handle != 0xFFFFFFFF)
   {
      IQXDM2.UnregisterClient( Handle );
   }
} 
 ////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////

//////////////////////////////////////////
// global mathematical constant  :
////////////////////////////////////////// 

////////////////////////////////////////////////

function Ln(x)
{
	return  Math.log(x) ;    // in JS log() means Ln()
}

////////////////////////////////////////////////
function log2(x)
{
	return Ln(x)/Ln(2) ; 
}//close function  log2

////////////////////////////////////////////////

////////////////////////////////////////////////
// LN10 == 2.302 which is Ln(10) [constant] 

function Log10(x)
{
	return Math.log(x)/Math.LN10 ; 
}
/////////////////////////////////////////////////////////

function dec2hex(d) 
{
return d.toString(16);
}

function hex2dec(h) 
{
return parseInt(h,16);
} 



//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
function checkIfFieldIsID( Fields , idx)
{
	var str =  Fields.GetFieldName(idx , 1) ;
	var len = str.length ; 
	if (str.substring(len-2, len) != "ID") 
	{ 		
		debugger;  // t;his means i have a bug in the num_of_fields calculation
		system("pause");
		return -1 ;
	}
}		
//////////////////////////////////////////////////////////////////////

function GetCurrentGainFromState( GainState  ) 
 {

	switch (GainState)
	{
	case 0: 
		return AcqStruct.GS0_Absolute_Gain ; 
	case 1: 
		return AcqStruct.GS1_Absolute_Gain ; 
	case 2: 
		return AcqStruct.GS2_Absolute_Gain ; 
	case 3: 
		return AcqStruct.GS3_Absolute_Gain ; 
	case 4: 
		return AcqStruct.GS4_Absolute_Gain ; 
	case 5: 
		return AcqStruct.GS5_Absolute_Gain ; 
	case 6: 
		return AcqStruct.GS6_Absolute_Gain ; 
	}//close switch

}// close function 
////////////////////////////////////////////////////////////////////////////////////////

function GetCurrentIncerTh( GainState , Jdmode ) 
{
switch (GainState)
	{
	case 0: 
		return (Jdmode == 1  ? AcqStruct.GS0_Incer_Th_mode1  : AcqStruct.GS0_Incer_Th_mode2 ) ; 
	case 1: 
		return (Jdmode == 1  ? AcqStruct.GS1_Incer_Th_mode1  : AcqStruct.GS1_Incer_Th_mode2 ) ; 
	case 2: 
		return (Jdmode == 1  ? AcqStruct.GS2_Incer_Th_mode1  : AcqStruct.GS2_Incer_Th_mode2 ) ; 
	case 3: 
		return (Jdmode == 1  ? AcqStruct.GS3_Incer_Th_mode1  : AcqStruct.GS3_Incer_Th_mode2 ) ; 
	case 4: 
		return (Jdmode == 1  ? AcqStruct.GS4_Incer_Th_mode1  : AcqStruct.GS4_Incer_Th_mode2 ) ; 
	case 5: 
		return (Jdmode == 1  ? AcqStruct.GS5_Incer_Th_mode1  : AcqStruct.GS5_Incer_Th_mode2 ) ; 
	case 6: 
		return (Jdmode == 1  ? AcqStruct.GS6_Incer_Th_mode1  : AcqStruct.GS6_Incer_Th_mode2 ) ; 
	}//close switch

}// close function 

////////////////////////////////////////////////////////////////////////////////////////

function GetCurrentDecrTh( GainState , Jdmode ) 
{
switch (GainState)
	{
	case 0: 
		return (Jdmode == 1  ? AcqStruct.GS0_Decr_Th_mode1  : AcqStruct.GS0_Decr_Th_mode2 ) ; 
	case 1: 
		return (Jdmode == 1  ? AcqStruct.GS1_Decr_Th_mode1  : AcqStruct.GS1_Decr_Th_mode2 ) ; 
	case 2: 
		return (Jdmode == 1  ? AcqStruct.GS2_Decr_Th_mode1  : AcqStruct.GS2_Decr_Th_mode2 ) ; 
	case 3: 
		return (Jdmode == 1  ? AcqStruct.GS3_Decr_Th_mode1  : AcqStruct.GS3_Decr_Th_mode2 ) ; 
	case 4: 
		return (Jdmode == 1  ? AcqStruct.GS4_Decr_Th_mode1  : AcqStruct.GS4_Decr_Th_mode2 ) ; 
	case 5: 
		return (Jdmode == 1  ? AcqStruct.GS5_Decr_Th_mode1  : AcqStruct.GS5_Decr_Th_mode2 ) ; 
	case 6: 
		return (Jdmode == 1  ? AcqStruct.GS6_Decr_Th_mode1  : AcqStruct.GS6_Decr_Th_mode2 ) ; 
	}//close switch

}// close function 

////////////////////////////////////////////////////////////////////////////////////////
function Convert_EeDvgaInp_Q6_To_dBFullScale( num  )
{
	// special cases of +- infinity
	if (num == 0 )
	{
		return "-Inf"
	}
	if (num == 65535/64 )
	{
		return "Inf" 
	}
/*
	var p  = Math.pow(2,num/64 - 1) ; 
	var denom = Math.pow(AcqStruct.adc_gain,2) * Math.pow(AcqStruct.Vadc_max,2) ; 
	var arg = Math.sqrt( p / denom  ) ; 
	return (20 * Log10(arg)).toFixed(0);
*/
// TODO read this values later froom the LOG  // TODO
//var digital_gain_factorQ6 = selectedTechnology == "ISDB-T" ? 1461 : 1485 ; 
var tmp = TenDivLog2Of10 * ( num - RawDataContainer.DigitalGainFactor ) ;
return tmp;  

}// close function 
/////////////////////////////////////////////////////////////////////////



function ConvertGain2dB(Gain) 
{  
return	   2 * TenDivLog2Of10 *Gain   ;

}

function ConvertPower2dB(Pwr) 
{   
return 	  TenDivLog2Of10*Pwr   ;


}


////////////////////////////////////////////////////////////////////////////////////////
function getRawDataFromCmmbLogBufferingStatus( Item  )
{
	var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	ItemTs = Item.GetItemSpecificTimestamp2()
	idx= 1; 

	VideoOverflowCount= Fields.GetFieldValue( idx++  );
	AudioOverflowCount= Fields.GetFieldValue( idx++  );
	VideoDiscardedUnitsOnOverflow= Fields.GetFieldValue( idx++  );
	AudioDiscardedUnitsOnOverflow= Fields.GetFieldValue( idx++  );
	VideoUnderflowCount= Fields.GetFieldValue( idx++  ); 
	AudioUnderflowCount= Fields.GetFieldValue( idx++  );
	VideoBufferSize = Fields.GetFieldValue( idx++  );
	VideoBufferDuration= Fields.GetFieldValue( idx++  );
	AudioBufferSize = Fields.GetFieldValue( idx++  );
	AudioBufferDuration = Fields.GetFieldValue( idx++  );
}
////////////////////////////////////////////////////////////////////////////////////////
function getRawDataFromCmmbEventSignalParams(Item)
{
	
	var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	ItemTs = Item.GetItemSpecificTimestamp2()
	idx= 1; 
	
	IsSync = IsSyncedEnum[  Fields.GetFieldValue( idx++  ) ] ;
	
	SignalStrengthInDbm  = Fields.GetFieldValue( idx++  );
	LDPCErrorRate        = Fields.GetFieldValue( idx++  );
}
////////////////////////////////////////////////////////////////////
function getRawDataFromCmmbLogCtrlTableUpdate(Item)
{
	//debugger; 
	var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	ItemTs = Item.GetItemSpecificTimestamp2()
	idx= 1; 
	var table_type = Fields.GetFieldValue( idx++  );
	
	switch (table_type)
	{
	case CMCT :
	{
		//debugger; 
		CMCT_available_services  = new Array() ; 
		CMCT_multiplexFrameId    = new Array() ; 
		getRawDataFromCmmbTable_CMCT_n_SMCT(Item , CMCT_available_services , CMCT_multiplexFrameId) ; 
		break ; 
	}
	
	case SMCT : 
	{
		//debugger; 
		SMCT_available_services  = new Array() ; 
		SMCT_multiplexFrameId    = new Array() ; 
		getRawDataFromCmmbTable_CMCT_n_SMCT(Item , SMCT_available_services , SMCT_multiplexFrameId) ; 
		break ; 
	}
	
	case CSCT : 
	{break ; 
	getRawDataFromCmmbTableCSCT(Item) ; 
	
	}
	
	case SSCT : 
	{break ; 
	getRawDataFromCmmbTableSSCT(Item) ; 
	
	}
	
	case NIT : 
	{break ; 
	getRawDataFromCmmbTableNIT(Item) ; 
	
	}
	case BasicDescriptionInformation : 
	{break ; 
	getRawDataFromCmmbTableBDI(Item) ; 
	
	}
	case EADT : 
	{break ; 
	getRawDataFromCmmbTableEADT(Item) ; 
	
	}
	
	
	}// close switch
	
	return table_type ;  
}// close function 
////////////////////////////////////////////////////////////////////
function getRawDataFromCmmbTable_CMCT_n_SMCT(Item , available_services , multiplexFrameId )
	{
	var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	var head_ptr = 0 ; 
	
	var quantityOfMultiplexFrames = Fields.GetFieldValue( 4 );
	idx=5;
	for (var k = 0 ; k < quantityOfMultiplexFrames ; k++ )
	{
	
		var MF_ID  = Fields.GetFieldValue( idx  );
		idx+= 6 ; 
		var quantity_of_slots = Fields.GetFieldValue( idx  );
		idx+= quantity_of_slots ;
		idx+=1 ;  
		quantityOfSubFrames  = Fields.GetFieldValue( idx  );
		
			for (var m = 0 ; m < quantityOfSubFrames ; m++ )
			{
				idx+=2;
				var SvcID  = Fields.GetFieldValue( idx  );
				
				if (MF_ID != 0 )
				 {
					available_services[head_ptr] = SvcID; 
					multiplexFrameId[head_ptr] = MF_ID;
					head_ptr++ ;  
				 }
			}// loop over SF
		idx++ ; 
	}// loop over the MF
}// close function
	
	

	////////////////////////////////////////////////////////////////////

function getRawDataFromCmmbTableNIT(Item)  
{
var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	ItemTs = Item.GetItemSpecificTimestamp2()
	idx= 1; 
	// not supported
}
////////////////////////////////////////////////////////////////////
function getRawDataFromCmmbTableBDI(Item)  
{
var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	ItemTs = Item.GetItemSpecificTimestamp2()
	idx= 1; 
	networkLevel = Fields.GetFieldValue( idx++  );
	networkNumber = Fields.GetFieldValue( idx++  );
	quantityOfMultiplexFrames = Fields.GetFieldValue( idx++  );
	localTimeOffset = Fields.GetFieldValue( idx++  );
	CharacterEncodingType = Fields.GetFieldValue( idx++  );
	NumberOfESGServices = Fields.GetFieldValue( idx++  );
	
	for (var i =0 ; i <NumberOfESGServices ; i++ )
	{
		EsgServiceDescriptions[i] = Fields.GetFieldValue( idx++  );
	}
	
	NumberOfDataTypes = Fields.GetFieldValue( idx++  );
	
	for (var i =0 ; i <NumberOfDataTypes ; i++ )
	{
		DataTypeDescriptions[i] = Fields.GetFieldValue( idx++  );
	}
}
////////////////////////////////////////////////////////////////////
function getRawDataFromCmmbTableEADT(Item)  
{
var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	ItemTs = Item.GetItemSpecificTimestamp2()
	idx= 1; 
	updateNumber = Fields.GetFieldValue( idx++  );
	sectionNumber = Fields.GetFieldValue( idx++  );
	sectionQuantity = Fields.GetFieldValue( idx++  );
}
////////////////////////////////////////////////////////////////////






////////////////////////////////////////////////////////////////////

function  getRawDataFRomSubPktID(  Item , subpkt_ID  , periodic_items_name,resolution  )
{ 
	var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	
	var Logversion           = Fields.GetFieldValue( 0 );
    selectedTechnology = Fields.GetFieldValue( 0 ) == 1 ? "ISDB-T" : "DVB-H" ;  

	var idx  = 0 ; 
	idx  = calculateFirstFieldIdxById ( subpkt_ID , Fields ) ; 
	if (idx < 0 ) { return ; } // the desired ID doesnt appear in this LOG , nothing to take
	
	switch (subpkt_ID) 
	{
		case SIGNAL_QUALITY_SBPKT_ID  : 
			getSignalQualityRawData( Item , idx) ;
		break ; 
	
		case TRACKING_LOOP_SBPKT_ID: 
			getTrackingLoopRawData( Item , idx)  ; 
		break ; 

		case STATUS_SBPKT_ID  : 
			getStatusRawData( Item , idx) ;			
		break ; 
	
		case MEAS_INFO_SBPKT_ID :   
			getMeasurmentRawData( Item , idx) ;		
		break ; 
	
		case  CIR_SBPKT_ID: 
			getCIRRawData( Item , idx) ; 
		break ; 
	
		case AGC_SBPKT_ID : 
			getAGCRawData( Item , idx) ; 
		break ; 

		case CTA_SBPKT_ID : 
			getCTARawData( Item , idx) ; 
		break ; 
		
		case CFA_SBPKT_ID :  
			getCFARawData( Item , idx) ;  
		break ; 

		case CFB_SBPKT_ID : 
			getCFBRawData( Item , idx) ;    
		break ; 
		
		case ACQ_LIKELIHOOD_SBPKT_ID :
		break ; 
		
		case JAM_FFT_OUTPUT_SBPKT_ID : 
			getJammerRawData( Item , idx) ;  
		break ; 
		
		
		case PERIODIC_SBPKT_ID :
			getPeriodicRawData(  Item , periodic_items_name  , idx,resolution) ;
		break ; 
		 
		case RF_DATA_SBPKT_ID:
			getAcquisitionRawData( Item , idx) ; 
		break ; 
		
		case DETAILED_ACQ_SBPKT_ID: 
             getDetailedAcquisitionRawData( Item , idx) ; 
		break ; 
	
		case DOPPLER_SBPKT_ID :  
			getDopplerRawData( Item , idx) ; 
		break ; 	

}// close switch


}// close function 
///////////////////////////////////////////////////////////////////////////////////////////////////////
function  getDetailedAcquisitionRawData( Item , idx) 
{

var Fields                               = Item.GetItemFields();
if (Fields == null) {return ;   }
	idx++ ; //ID
		var ver                         =  Fields.GetFieldValue( idx++ );
	   	selectedTechnology = Fields.GetFieldValue( idx++  ) == 1 ? "ISDB-T" : "DVB-H" ;
	    idx++ ; 
		
		var  symbol_counter            = Fields.GetFieldValue( idx++ );
		var RTC                       = Fields.GetFieldValue( idx++ );
		RawDataContainer.XaxisData[0] =  symbol_counter ; 
		var FW_state                  = Fields.GetFieldValue( idx++ );
		RawDataContainer.Log2Ee[0]               = Fields.GetFieldValue( idx++ )/64;
		
		
		//RawDataContainer.AGC_filter_state          = Fields.GetFieldValue( idx++ );
		RawDataContainer.Log2DvgaGain[0]          = Fields.GetFieldValue( idx++ ) /4096 ; // Log2DvgaGain 
		var GS_and_Log2EeDVGAInpQ6                 = Fields.GetFieldValue( idx++ );
		RawDataContainer.GainState[0]               = (GS_and_Log2EeDVGAInpQ6 >> 16 ) ; 
	  RawDataContainer.log2EeDvgaInp[0]          = (GS_and_Log2EeDVGAInpQ6 & 0xFFFF ) / 64 ; 
		
		RawDataContainer.CoarseDC_I[0]             = Fields.GetFieldValue( idx++ );
		RawDataContainer.CoarseDC_Q[0]             = Fields.GetFieldValue( idx++ );
		RawDataContainer.FineDC_I[0]               = Fields.GetFieldValue( idx++ );
		RawDataContainer.FineDC_Q[0]               = Fields.GetFieldValue( idx++ );
	     
		if (symbol_counter ==0 ) 
		{
			RawDataContainer.ACQ_state = ACQ_State_DC_WU ; 
		}else if (FW_state ==1)
		{
			RawDataContainer.ACQ_state = ACQ_State_AGC_WU ; 
		}else if (FW_state ==2)
		{
			RawDataContainer.ACQ_state = ACQ_State_JD ; 
		}else{
			RawDataContainer.ACQ_state = ACQ_State_REST ; 

		} 

	        if ( idx <  Fields.GetFieldCount()  ) {
			checkIfFieldIsID ( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
		}

}


///////////////////////////////////////////////////////////////////////////////////////////////////////
function getSignalQualityRawData(Item , idx) 
		{
			var Fields                               = Item.GetItemFields();
			if (Fields == null) {return ;   }
			
			idx++ ; //ID
		var ver                         =  Fields.GetFieldValue( idx++ );
	   	selectedTechnology = Fields.GetFieldValue( idx++  ) == 1 ? "ISDB-T" : "DVB-H" ;
	    idx++ ; 
		
		RawDataContainer.corr_snr_db                 = Fields.GetFieldValue( idx++ )/ 64;
		RawDataContainer.min_req_input_pwr_db_q8        = Fields.GetFieldValue( idx++ )/ 256;
		RawDataContainer.status_rssi            = Fields.GetFieldValue( idx++ )/ 64;
		RawDataContainer.LNA_state                      = Fields.GetFieldValue( idx++ );

		idx++ ; //Reserved field	
		if ( ver >= 2 ) 
		{
			RawDataContainer.FrameTotalRsPackets            = Fields.GetFieldValue( idx++ );
			RawDataContainer.FrameTrashedRsPackets          = Fields.GetFieldValue( idx++ );
			RawDataContainer.GoodFrameThresh                = Fields.GetFieldValue( idx++ );
			RawDataContainer.BadFrameCounter                = Fields.GetFieldValue( idx++ );
			RawDataContainer.BadFrameRecoveryThresh         = Fields.GetFieldValue( idx++ );
			RawDataContainer.Rs1LockFrameCounter            = Fields.GetFieldValue( idx++ );
			RawDataContainer.Rs1LockFrameSoftResetThresh    = Fields.GetFieldValue( idx++ );
			RawDataContainer.FailedAcqCounter               = Fields.GetFieldValue( idx++ );
			RawDataContainer.EndlessAcqSoftResetThresh      = Fields.GetFieldValue( idx++ );
			RawDataContainer.FrameSignalStatus              = Fields.GetFieldValue( idx++ );
		}	

		
		
		if (ver>= 3 )
		 { 
				RawDataContainer.SNR_Estimation                = Fields.GetFieldValue( idx++ )/64;
				RawDataContainer.analog_JD_mode                 = Fields.GetFieldValue( idx++ );
				RawDataContainer.selected_Channel_Est_alg       = Fields.GetFieldValue( idx++ );
		}else{
	      	   RawDataContainer.SNR_Estimation                     = 0 ; 
				RawDataContainer.analog_JD_mode                  = "NA" ; 
				RawDataContainer.selected_Channel_Est_alg       = "NA" ; 
		
		
		}
		
		
		if (ver >= 4) 
		{
	 		RawDataContainer.AdcLevel                = Fields.GetFieldValue( idx++ )/64;
	 		RawDataContainer.AjdRssiThreshSkipDetect = Fields.GetFieldValue( idx++ )/64;
	 		RawDataContainer.AjdNumFramesInMode      = Fields.GetFieldValue( idx++ );
	 		RawDataContainer.AjdRssiThresModeSwitch  = Fields.GetFieldValue( idx++ )/64;
	 		RawDataContainer.AjdMode2ReleaseCtr      = Fields.GetFieldValue( idx++ );
			RawDataContainer.AjdModeTransition       = Fields.GetFieldValue( idx++ );
			idx++ ; 
			idx++ ; 
		}else{
		    var AbsoluteGain   = GetCurrentGainFromState(RawDataContainer.LNA_state);
		   var AbsoluteGainDb = ConvertGain2dB(AbsoluteGain);
			RawDataContainer.AdcLevel =  RawDataContainer.status_rssi  + AbsoluteGainDb - RawDataContainer.BwCorrectionFactorDb -AcqStruct.Padc_max ;

		}
		
		
	
		
	// thie value is now taken directly form logs.	
	//	
		 
	    RawDataContainer.XaxisData              = new Array(1) ; // array with one element to be compatible with Periodic 
        RawDataContainer.XaxisData[0]           = Item.GetItemSpecificTimestamp2() ; 
        
        if ( idx <  Fields.GetFieldCount()  ) {	
		checkIfFieldIsID( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
		}
        
}
///////////////////////////////////////////////////////////////////////////////////////////////////////
function getTrackingLoopRawData( Item , idx) 
{
		var Fields            = Item.GetItemFields();
		if (Fields == null) {return ;   }
		
		idx++ ; 
		var ver                         =  Fields.GetFieldValue( idx++ );
		idx+=2 ; 
		RawDataContainer.Freq_track_mode       = Fields.GetFieldValue( idx++ );
		idx++ ; //reserved
		RawDataContainer.freq_offset            = -Fields.GetFieldValue( idx++ );
		RawDataContainer.Pdm_value              = Fields.GetFieldValue( idx++ );
		RawDataContainer.Fap                    = makeSigned( Fields.GetFieldValue( idx++ ), 16 ) ;
		RawDataContainer.Lap                    = makeSigned( Fields.GetFieldValue( idx++ ) , 16 ) ; 
		RawDataContainer.adv_ret_acc            = makeSigned( Fields.GetFieldValue( idx++ ),16) ; 
		RawDataContainer.adv_ret_acc_cont       = makeSigned( Fields.GetFieldValue( idx++ ),16) ; 
		
		
		RawDataContainer.CoarseDC_I[0]          =  Fields.GetFieldValue( idx++  ) / 64 ;
		
		RawDataContainer.CoarseDC_Q[0]          =  Fields.GetFieldValue( idx++  ) / 64;

	
		RawDataContainer.FineDC_I[0]            =  Fields.GetFieldValue( idx++ ) / 64;
		
		RawDataContainer.FineDC_Q[0]            = Fields.GetFieldValue( idx++ ) / 64 ;
		
		RawDataContainer.mode                = Fields.GetFieldValue( idx++ );
		UpdateModeRelatedVars();
			
		
		RawDataContainer.guard               = gGuardEnum[Fields.GetFieldValue( idx++ )];
		RawDataContainer.modulation_type        = gEnumModulation [ Fields.GetFieldValue( idx++ )] ;
		
		
		if (ver>=3) {
			RawDataContainer.TimeTrackFreezeCount       = Fields.GetFieldValue( idx++ );
		}
		
        RawDataContainer.XaxisData[0]                  = Item.GetItemSpecificTimestamp2() ; 
        
        if ( idx <  Fields.GetFieldCount()  ) {		
	    	checkIfFieldIsID( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
	}
 }// close function getTrackingLoopRawData
///////////////////////////////////////////////////////////////////////////////////////////////////////		
	
function getStatusRawData( Item , idx) 
{ 
	    var Fields            = Item.GetItemFields();
	    if (Fields == null) {return ;   }
		
		idx+=1 ; 
		var ver                             = Fields.GetFieldValue( idx++ );
		selectedTechnology = Fields.GetFieldValue( idx++  ) == 1 ? "ISDB-T" : "DVB-H" ;
		idx+=1 ; 
		RawDataContainer.reference_cnt                  = Fields.GetFieldValue( idx++ );
		RawDataContainer.NumPreViterbiBitErrs           = Fields.GetFieldValue( idx++ );///RVSER
				
		var tmp                                         = Fields.GetFieldValue( idx++ );
		RawDataContainer.NumViterbiPkts     =           (tmp & 0xFFFFFFF) ;  // takes bits [27..0]
		
	    var codeRateData =      tmp >> 29  ; // takes bits [31..29]
 
		if (codeRateData < 0 ) 
		{
			codeRateData+=8; 
		}
 
		RawDataContainer.code_rate_val = code_rate_Enum [ codeRateData]   ;
		RawDataContainer.code_rate_str  = code_rate_str_Enum [ codeRateData] ; 

		RawDataContainer.NumRsPkts                    = Fields.GetFieldValue( idx++ ); 
		RawDataContainer.NumRSTrashPkts                = Fields.GetFieldValue( idx++ );
		RawDataContainer.AverageViterbiBer             = Fields.GetFieldValue( idx++ )/4294967296;
		RawDataContainer.InstViterbiBer                = Fields.GetFieldValue( idx++ )/4294967296;
		RawDataContainer.ESR_Total_Seconds             = Fields.GetFieldValue( idx++ );
		RawDataContainer.ESR_Erroneous_Seconds         = Fields.GetFieldValue( idx++ );
		RawDataContainer.AveragePreViterbiBER          = Fields.GetFieldValue( idx++ )/65536;
		
		RawDataContainer.interleaver_length            = Fields.GetFieldValue( idx++ );
		curr_state_num                                =  Fields.GetFieldValue( idx++ );
		RawDataContainer.L1_SW_state_str               = StatesNamesEnum[curr_state_num ];
		
		
		
		
		if (curr_state_num >= 4) 
		{
			RawDataContainer.Acq_status = "SUCCESS" ; 
		}
		idx++ // reseved
		
		RawDataContainer.XaxisData          = new Array(1) ; // array with one element to be compatible with Periodic 
		RawDataContainer.XaxisData[0]       = Item.GetItemSpecificTimestamp2() ; 
		
		if (firstTime) {
		base_time = RawDataContainer.XaxisData[0] ; 
		firstTime = false ; 
		}
		
		RawDataContainer.StatusSubPktReady = true ; 
		if ( idx <  Fields.GetFieldCount()  )
		 {	 	
		checkIfFieldIsID(Fields , idx); // this is for debug only , in order to check if we read the subpacket correctly
		}
	
}//close function getStatusRawData



///////////////////////////////////////////////////////////////////////////////////////////////////////
function  getMeasurmentRawData ( Item , idx)
{	
		
			var Fields            = Item.GetItemFields();
			if (Fields == null) {return ;   }
			
			
		idx+=4 ; 
		RawDataContainer.uts_id                = Fields.GetFieldValue( idx++ );
		RawDataContainer.freq_mhz             = (Fields.GetFieldValue( idx++ )/1e6);
		RawDataContainer.current_cell_id       = Fields.GetFieldValue( idx++ );
		idx++ ; //Reserved field Reserved
		RawDataContainer.Priority              = Fields.GetFieldValue( idx++ );
		RawDataContainer.uts_id_present        = Fields.GetFieldValue( idx++ );
		RawDataContainer.meas_type             = Fields.GetFieldValue( idx++ );
		idx++;
		if ( idx <  Fields.GetFieldCount()  ) {	 	
		checkIfFieldIsID ( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
		}
		
}
///////////////////////////////////////////////////////////////////////////////////////////////////////
function getCIRRawData( Item , idx) 
{ 
			var Fields            = Item.GetItemFields();
			if (Fields == null) {return ;   }

		idx++; // ID
		RawDataContainer.version =  Fields.GetFieldValue( idx++ ) ; 
		selectedTechnology = Fields.GetFieldValue( idx++  ) == 1 ? "ISDB-T" : "DVB-H" ;
		idx++ ; // subpkt size 
		RawDataContainer.Packet_number  = Fields.GetFieldValue( idx++ );
		RawDataContainer.isOdd         = Fields.GetFieldValue( idx++ );
		idx++; // reserved
		RawDataContainer.mode    = Fields.GetFieldValue( idx++ );
		UpdateModeRelatedVars();
		RawDataContainer.guard   = gGuardEnum [ Fields.GetFieldValue( idx++ )];
		idx++; // reserved
		RawDataContainer.RTC   = Fields.GetFieldValue( idx++ );
		RawDataContainer.Number_of_Paths   = Fields.GetFieldValue( idx++ );
		RawDataContainer.response_type   = Fields.GetFieldValue( idx++ );
 

if ( RawDataContainer.channel_response_arr == undefined) {
  RawDataContainer.channel_response_arr = new Array(RawDataContainer.Number_of_Paths ) ;
 } 
   for(var  j = 0 ; j < RawDataContainer.Number_of_Paths ; j++ )
   {     
		RawDataContainer.channel_response_arr[j] =  Fields.GetFieldValue( idx++ ) ;    
   } 
	
		if ( idx <  Fields.GetFieldCount()  ) {	 	
		checkIfFieldIsID ( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
		}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
function getAGCRawData( Item , idx) 
{

	var Fields            = Item.GetItemFields();
	if (Fields == null) {return ;   }
	idx+=1 ; 
	RawDataContainer.subPktVersion                        = Fields.GetFieldValue( idx++ );
	idx+=2 ; 
	RawDataContainer.lna_state_bfr_jammer_rem            = Fields.GetFieldValue( idx++ );
	RawDataContainer.agc_filter_state_bfr_jammer_rem      = Fields.GetFieldValue( idx++ );
	RawDataContainer.lna_state_aftr_jammer_rem            = Fields.GetFieldValue( idx++ );
	RawDataContainer.agc_filter_state_aftr_jammer_rem     = Fields.GetFieldValue( idx++ );
	RawDataContainer.num_jammers                          = Fields.GetFieldValue( idx++ );
	RawDataContainer.Bw                                   = Fields.GetFieldValue( idx++ );
	idx++; 
	
	RawDataContainer.jammer_notch_i_buf  = new Array(N) ;  
	RawDataContainer.jammer_notch_q_buf = new Array(N) ; 
	RawDataContainer.jammer_max_peak_buf             = new Array(N) ;  
	RawDataContainer.Jammer_max_peak_pos_interp_buf    = new Array(N) ; 
	
	for (var i= 0 ; i< N ; i++ )
	{
		RawDataContainer.jammer_notch_i_buf[i]                = Fields.GetFieldValue( idx++ );
	}
 
 	for (var i= 0 ; i< N ; i++ )
	{
		RawDataContainer.jammer_notch_q_buf[i]                    = Fields.GetFieldValue( idx++ );
	}
	
	for (var i= 0 ; i< N ; i++ )
	{
		RawDataContainer.jammer_max_peak_buf[i]                  = Fields.GetFieldValue( idx++ );
	}
	for (var i= 0 ; i< N ; i++ )
	{
		RawDataContainer.Jammer_max_peak_pos_interp_buf[i]          = Fields.GetFieldValue( idx++ );
	}
	
	RawDataContainer.status_rssi                             = Fields.GetFieldValue( idx++ )/64;
	RawDataContainer.FW_state_at_end_of_acquisition       = Fields.GetFieldValue( idx++ );
	RawDataContainer.L1_SW_state_when_sub_packet_logged   = Fields.GetFieldValue( idx++ );
	

	if (RawDataContainer.subPktVersion  >= 4 ) 
	{
		RawDataContainer.freq_mhz                             = Fields.GetFieldValue( idx++ ) / 1e6;
		RawDataContainer.analog_JD_mode                          = Fields.GetFieldValue( idx++ );
	}
	
	if (RawDataContainer.subPktVersion  >= 5 ) 
	{
	    RawDataContainer.fw_sub_version    = Fields.GetFieldValue( idx++ );
		RawDataContainer.fw_ver            = Fields.GetFieldValue( idx++ );
		RawDataContainer.sw_build         = Fields.GetFieldValue( idx++ );
		RawDataContainer.sw_release       = Fields.GetFieldValue( idx++ );
		RawDataContainer.sw_ver           = Fields.GetFieldValue( idx++ );
		idx++ ; 
	}
	
	if (RawDataContainer.subPktVersion  >= 6 ) 
	{
	    RawDataContainer.AjdM1NumAcqRetriesLeftInMode     = Fields.GetFieldValue( idx++ );
		RawDataContainer.AjdModeNextAcq                   = Fields.GetFieldValue( idx++ );
		idx++;
		RawDataContainer.NoSignalTimerMsec               = Fields.GetFieldValue( idx++ );
	
	}
	

	
	if ( idx <  Fields.GetFieldCount()  ) {	 	
		checkIfFieldIsID( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
	  }
} 
 ///////////////////////////////////////////////////////////////////////////////////////////////////////
 function getCTARawData( Item , idx) 
 {
        var Fields            = Item.GetItemFields();
        if (Fields == null) {return ;   }
       idx+=4 ; 
        RawDataContainer.mode             = Fields.GetFieldValue( idx++ );
		UpdateModeRelatedVars();
		RawDataContainer.guard            = gGuardEnum [ Fields.GetFieldValue( idx++ ) ] ;  
		RawDataContainer.Bw               = Fields.GetFieldValue( idx++ );
		idx++; 
		RawDataContainer.Fap             = makeSigned( Fields.GetFieldValue( idx++ ), 16 ) ;
		RawDataContainer.Lap             = makeSigned( Fields.GetFieldValue( idx++ ) , 16 ) ; 
		RawDataContainer.Time_offset     = Fields.GetFieldValue( idx++ );
		RawDataContainer.Coarse_backoff  = Fields.GetFieldValue( idx++ );
	
		RawDataContainer.timeAcqMalBuf = new Array();
		
		for ( var i = 0 ; i < 12 ; i++ )
		{
			RawDataContainer.timeAcqMalBuf[i]   = Fields.GetFieldValue( idx++ );
		}
		
		if ( idx <  Fields.GetFieldCount()  ) {	 	
		checkIfFieldIsID( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
		}
}
  ///////////////////////////////////////////////////////////////////////////////////////////////////////
  function getCFARawData( Item , idx)   
		{
		var Fields            = Item.GetItemFields();
		if (Fields == null) {return ;   }
		RawDataContainer.max_amp = 0 ;
		var correction_factor = 65536 * AgcSetPointCfa ; 
		
		 
		idx+= 1; 
			var ver = Fields.GetFieldValue( idx++ );
		idx+=2 ; 
		RawDataContainer.freq_offset                   = -Fields.GetFieldValue( idx++ );
		RawDataContainer.freq_acq_norm_egy             = Fields.GetFieldValue( idx++ );
		RawDataContainer.Number_of_Averages            = Fields.GetFieldValue( idx++ );
		
		idx++;  //Reserved
	    RawDataContainer.AverageI                        = Fields.GetFieldValue( idx++ )/correction_factor /RawDataContainer.Number_of_Averages ;
	    RawDataContainer.AverageQ                        = Fields.GetFieldValue( idx++ )/correction_factor / RawDataContainer.Number_of_Averages ;
		
		
		RawDataContainer.I_array = new Array(RawDataContainer.Number_of_Averages) ; 
		RawDataContainer.Q_array = new Array(RawDataContainer.Number_of_Averages) ; 
		
		
	
		 var amp = 0 , I , Q ; 
		for ( var i= 0 ; i < RawDataContainer.Number_of_Averages  ; i++ )
		{
			RawDataContainer.I_array[i]              = Fields.GetFieldValue( idx++ )/correction_factor;
			RawDataContainer.Q_array[i]              = Fields.GetFieldValue( idx++ )/correction_factor;
			
			I = RawDataContainer.I_array[i] ; 
			Q = RawDataContainer.Q_array[i] ; 
			
			amp  = Math.sqrt(I*I + Q*Q );
			if (amp > RawDataContainer.max_amp ) 
			{
				RawDataContainer.max_amp  = amp;
			}
		}
		
		if ( idx <  Fields.GetFieldCount()  ) {	 	
			checkIfFieldIsID ( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
		}
}
///////////////////////////////////////////////////////////////////////////////////////////////////////
 function getCFBRawData( Item , idx) 
{  
		var Fields            = Item.GetItemFields();
		if (Fields == null)  {return ;   }
			
		idx+=4 ; 
		RawDataContainer.pilot_offset_adj             = Fields.GetFieldValue( idx++ );
		RawDataContainer.freq_bin_offset              = Fields.GetFieldValue( idx++ );
		RawDataContainer.mode                         = Fields.GetFieldValue( idx++ );
		UpdateModeRelatedVars();
		RawDataContainer.Bw                           = Fields.GetFieldValue( idx++ );
		RawDataContainer.XO_frequency_error           = -(Fields.GetFieldValue( idx++ )/16777216) * 1e6 ; ;
		RawDataContainer.freq_bin_uncertainty         = Fields.GetFieldValue( idx++ );
		
		
		RawDataContainer.binAcqMaxResp_arr = new Array();
		for (var i = 0 ; i < 4*(2*RawDataContainer.freq_bin_uncertainty+1) ; i++ )
		{
			RawDataContainer.binAcqMaxResp_arr[i] = Fields.GetFieldValue( idx++ );	
		}// close for loop 
		
		if ( idx <  Fields.GetFieldCount()  ) {	 	
			checkIfFieldIsID( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
		}	
}
///////////////////////////////////////////////////////////////////////////////////////////////////////
 function getJammerRawData ( Item , idx) 
{
		var Fields            = Item.GetItemFields();
		if (Fields == null) {return ;   }
		
	idx+=4 ; 
	RawDataContainer.Packet_number             = Fields.GetFieldValue( idx++ );
	RawDataContainer.isOdd              = Fields.GetFieldValue( idx++ );
	
	if ( idx <  Fields.GetFieldCount()  ) {		
		checkIfFieldIsID ( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
	}
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function getAcquisitionRawData(  Item , idx) 
{
   var Fields                                = Item.GetItemFields();
   if (Fields == null) {return ;   }
   
   AcqStruct.Padc_max =  7 ;  // [ dBm ] 
   AcqStruct.Vadc_max = 0.5 ; 
    
    idx+=1 ; 
	RawDataContainer.subPktVersion               = Fields.GetFieldValue( idx++ );  
    AcqStruct.technology =                  (Fields.GetFieldValue( idx++ ) == 1 ? "ISDB-T" : "DVB-H" );
    
	idx++;
	AcqStruct.num_of_gain_states            = Fields.GetFieldValue( idx++ );
	idx+=3 ; // 3* reserved
	
	AcqStruct.GS0_Incer_Th_mode1            = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS0_Decr_Th_mode1             = Fields.GetFieldValue( idx++ )/64;  
	AcqStruct.GS0_Incer_Th_mode2            = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS0_Decr_Th_mode2             = Fields.GetFieldValue( idx++ )/64;  
	AcqStruct.GS0_Absolute_Gain             = makeSigned( Fields.GetFieldValue( idx++) , 16 ) / 1024;
	AcqStruct.GS0_Gain_Step                 = Fields.GetFieldValue( idx++ ) / 4096;  
	AcqStruct.GS0_Phase_Correction          = Fields.GetFieldValue( idx++ ); 

 
	AcqStruct.GS1_Incer_Th_mode1            = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS1_Decr_Th_mode1             = Fields.GetFieldValue( idx++ )/64; 
	AcqStruct.GS1_Incer_Th_mode2            = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS1_Decr_Th_mode2             = Fields.GetFieldValue( idx++ )/64;  
	AcqStruct.GS1_Absolute_Gain             = makeSigned(  Fields.GetFieldValue( idx++ ) , 16)/ 1024 ;
	AcqStruct.GS1_Gain_Step                 = Fields.GetFieldValue( idx++ )/4096;  
	AcqStruct.GS1_Phase_Correction          = Fields.GetFieldValue( idx++ );
	
	AcqStruct.GS2_Incer_Th_mode1            = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS2_Decr_Th_mode1             = Fields.GetFieldValue( idx++ )/64;  
	AcqStruct.GS2_Incer_Th_mode2            =  Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS2_Decr_Th_mode2             = Fields.GetFieldValue( idx++ )/64; 
	AcqStruct.GS2_Absolute_Gain             = makeSigned(Fields.GetFieldValue( idx++ ),16)/ 1024;
	AcqStruct.GS2_Gain_Step                 = Fields.GetFieldValue( idx++ )/ 4096;  
	AcqStruct.GS2_Phase_Correction          = Fields.GetFieldValue( idx++ ); 	

	AcqStruct.GS3_Incer_Th_mode1            = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS3_Decr_Th_mode1				= Fields.GetFieldValue( idx++ )/64;  
	AcqStruct.GS3_Incer_Th_mode2			= Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS3_Decr_Th_mode2				= Fields.GetFieldValue( idx++ )/64; 
	AcqStruct.GS3_Absolute_Gain             = makeSigned( Fields.GetFieldValue( idx++ ),16)/1024;
	AcqStruct.GS3_Gain_Step                 = Fields.GetFieldValue( idx++ )/4096;  
	AcqStruct.GS3_Phase_Correction          = Fields.GetFieldValue( idx++ ); 

	AcqStruct.GS4_Incer_Th_mode1             = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS4_Decr_Th_mode1			     = Fields.GetFieldValue( idx++ )/64;  
	AcqStruct.GS4_Incer_Th_mode2             = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS4_Decr_Th_mode2              = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS4_Absolute_Gain              = makeSigned( Fields.GetFieldValue( idx++ ),16)/1024;
	AcqStruct.GS4_Gain_Step                  = Fields.GetFieldValue( idx++ )/4096;  
	AcqStruct.GS4_Phase_Correction           = Fields.GetFieldValue( idx++ );  	

	AcqStruct.GS5_Incer_Th_mode1            = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS5_Decr_Th_mode1             = Fields.GetFieldValue( idx++ )/64;  
	AcqStruct.GS5_Incer_Th_mode2            = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS5_Decr_Th_mode2             = Fields.GetFieldValue( idx++ )/64;  
	AcqStruct.GS5_Absolute_Gain             = makeSigned(Fields.GetFieldValue( idx++ ) , 16 ) /1024;
	AcqStruct.GS5_Gain_Step                = Fields.GetFieldValue( idx++ )/4096;  
	AcqStruct.GS5_Phase_Correction         = Fields.GetFieldValue( idx++ ); 	
	
	AcqStruct.GS6_Incer_Th_mode1            = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS6_Decr_Th_mode1             = Fields.GetFieldValue( idx++ )/64;  
	AcqStruct.GS6_Incer_Th_mode2            = Fields.GetFieldValue( idx++ )/64;
	AcqStruct.GS6_Decr_Th_mode2             = Fields.GetFieldValue( idx++ )/64;  
	AcqStruct.GS6_Absolute_Gain             = makeSigned(Fields.GetFieldValue( idx++ ) , 16 )/1024;
	AcqStruct.GS6_Gain_Step                  = Fields.GetFieldValue( idx++ )/4096  ; 
	AcqStruct.GS6_Phase_Correction           = Fields.GetFieldValue( idx++ );  	

	
	AcqStruct.adc_gain        = Fields.GetFieldValue( idx++ ); 
	
	//AcqStruct.adc_gain =  (AcqStruct.technology ==  "ISDB-T") ?  7760 : 4400 ; 
	
	idx++ ; //reseved

	AcqStruct.spur_freq_0 = Fields.GetFieldValue( idx++ );
	AcqStruct.spur_freq_1 = Fields.GetFieldValue( idx++ );
	AcqStruct.spur_freq_2 = Fields.GetFieldValue( idx++ );


	AcqStruct.spur_type_0 = Fields.GetFieldValue( idx++ );
	AcqStruct.spur_type_1 = Fields.GetFieldValue( idx++ );
	AcqStruct.spur_type_2 = Fields.GetFieldValue( idx++ );

	AcqStruct.resampler_en =  Fields.GetFieldValue( idx++ );
	AcqStruct.ReSampler_freq_raw =  Fields.GetFieldValue( idx++ );

	AcqStruct.ReSampler_freq = ((AcqStruct.ReSampler_freq_raw / Math.pow(2,24)) + 1 )*8*(64/63)*1e6 ; 
	
	

	if (RawDataContainer.subPktVersion >=2 ) 
	{
			RawDataContainer.RF_SW_Version = Fields.GetFieldValue( idx++ );
			RawDataContainer.BwCorrectionFactorDb = Fields.GetFieldValue( idx++ )/64;
			RawDataContainer.DigitalGainFactor = Fields.GetFieldValue( idx++ ) /64;
			
			RawDataContainer.MinusLog2CoarseDcWuGain = Fields.GetFieldValue( idx++ );
			RawDataContainer.MinusLog2FineDcWuGain = Fields.GetFieldValue( idx++ );
			RawDataContainer.MinusLog2CoarseDcSsGain = Fields.GetFieldValue( idx++ );
			RawDataContainer.MinusLog2FineDcSsGain = Fields.GetFieldValue( idx++ );
			
			RawDataContainer.Coarse_DC_Enabled = Fields.GetFieldValue( idx++ );
			
			RawDataContainer.RF_chip_type = Fields.GetFieldValueText(idx++)	;

			RawDataContainer.BB_chip_type =  Fields.GetFieldValueText(idx++)	;
			RawDataContainer.Gamla_type =  Fields.GetFieldValueText(idx++)	;
	}  
	
	
	AcqStruct.ContainAcqData = true ; 	
	
	if ( idx <  Fields.GetFieldCount()  ) {	 	
		checkIfFieldIsID( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
	}
		
}// close function  

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function getDopplerRawData(   Item , idx) 
	{
		 
		var Fields                          = Item.GetItemFields();
		if (Fields == null) {return ;   }
		idx+=4 ; 
		RawDataContainer.Estimation_Result  = Fields.GetFieldValue( idx++ )/4 ;
		RawDataContainer.FIR_Output         = Fields.GetFieldValue( idx++ );
		RawDataContainer.Max_Hold_Output    = Fields.GetFieldValue( idx++ );
		RawDataContainer.Max_Hold_Counter   = Fields.GetFieldValue( idx++ );
		
		RawDataContainer.XaxisData          = new Array(1) ; // array with one element to be compatible with Periodic 
		RawDataContainer.XaxisData[0]       = Item.GetItemSpecificTimestamp2() ; 
		 
		
		 RawDataContainer.HasDoppler = true ; 
		if ( idx <  Fields.GetFieldCount()  ) {	 	
			checkIfFieldIsID( Fields , idx);// this is for debug only , in order to check if we read the subpacket correctly
		}
		
}
///////////////////////////////////////////////////////////////////////////////////////////////////////
function calculateFirstFieldIdxById( subpkt_ID , Fields )  
{  
		
		var Num_Of_subPackets_In_Log = Fields.GetFieldValue( 1 );
		var  first_Field_idx ; 
		var num_of_subpkt_checked  = 0 ;  
		var next_subpkt_ID_idx = 3 ;// points to the firest subpacket ID field

		// while over the sub-packets in the LOG
		while (num_of_subpkt_checked < Num_Of_subPackets_In_Log) 
		{
				var current_ID =  Fields.GetFieldValue( next_subpkt_ID_idx );
	            checkIfFieldIsID(Fields , next_subpkt_ID_idx ) ; 

				if (current_ID  == subpkt_ID )  // we are pointing to the desired sub-packet
				{
						first_Field_idx  = next_subpkt_ID_idx    ; 
						return first_Field_idx ; 
				}else{
						var num_of_fields  = getNumOfFieldsInSubPkt ( Fields  , next_subpkt_ID_idx ) ; 
						
						
						next_subpkt_ID_idx += num_of_fields ; // now pointing to the next sub packet base index
						num_of_subpkt_checked++ ; 
				}// close case where id is not matched

		}// close while loop over the sub-packets
	
	return -1 ; // means that the specified ID doesnt appear in the current packet 
} // close function 
////////////////////////////////////////////////////////////////////////////////////////
///  PERIODIC IMPLEMENTATION 
////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function  getPeriodicRawData( Item , VIEW_NAME , idx , resolution) 
{
	if (resolution  == undefined ) 
	{
	  resolution= 1 ; 
	}
	var Fields            = Item.GetItemFields();
	if (Fields == null) {return ;   }
	idx+=4 ; 
	var  baseIndex  =  idx ; 
	var EnableMask         = Fields.GetFieldValue(idx++);  //
	var MEMC               = Fields.GetFieldValue(idx++);  //
	var numOfItemsEnabled  = sumBits(EnableMask);
	
	if (  numOfItemsEnabled == 0 )  return ;  //no logging is enabled
		
	var numOfFieldEnabled = calcNumFieldEn(EnableMask , MEMC);
    var numOfFields  =  Fields.GetFieldCount() - 10 ; 
    var itemNum = 0 ; 

    actual_len = numOfFields/(numOfFieldEnabled *resolution) ; 

	// "+ 3" is for MASK, MEMC and logging Interval fields
	///////////////////////////////////////////////////////////////////////////////////////
	// item '1' which is the second bit in the mask is RTC Symbol count                  //
	///////////////////////////////////////////////////////////////////////////////////////
		itemNum = 1 ; 
		 if (EnableMask & (1 << itemNum)) // 0x1	 	
		 {
			 var OFDM_SymNumBase =  baseIndex + 3 +  calcNumFieldEn( EnableMask & ((1 << itemNum)-1) , MEMC);   
			 for (var i = 0 ; i < actual_len ; i++) // gets the i'th row 
			   {	
				RawDataContainer.XaxisData[i] = Fields.GetFieldValue( OFDM_SymNumBase + i * resolution * numOfFieldEnabled ); 
	
				}// close for loop over Item rows
		
		  }else{
		  
		  }
		

switch (VIEW_NAME)
{
	case   "RSSI_GS_JdMode_ADC_Util" : 
	{

			///////////////////////////////////////////////////////////////////////////////////////
			// item '5' which is the sixth bit in the mask is   [ GainState ,  log2EeDvgaInp ] //
			///////////////////////////////////////////////////////////////////////////////////////	  
			itemNum= 5 ; 
			if (EnableMask &  (1<< itemNum)) // 0x20   
			{	
					
					var GS_and_Ee_Base  =  baseIndex + 3 +  calcNumFieldEn( EnableMask & ((1<< itemNum)-1) , MEMC);   
					
					for (var i = 0 ; i <actual_len ; i++) // gets the i'th row 
					{	
							RawDataContainer.GainState[i]        =   Fields.GetFieldValue( GS_and_Ee_Base + i * resolution * numOfFieldEnabled ); 
							RawDataContainer.log2EeDvgaInp[i]  =   Fields.GetFieldValue( GS_and_Ee_Base + i * resolution *numOfFieldEnabled  + 1 )/64; 
					}// close for loop over Item rows
			}

			///////////////////////////////////////////////////////////////////////////////////////
			// item '20' which is the twenty bit in the mask is  JammerDetection mode         //
			///////////////////////////////////////////////////////////////////////////////////////
			itemNum= 20 ; 
			if (EnableMask & (1<< itemNum)) //0x100000
			{	 
					
					var JDBase  =  baseIndex + 3 + calcNumFieldEn(EnableMask & ((1<< itemNum)-1) , MEMC);  
					for (var i = 0 ; i < actual_len ; i++) // gets the i'th row 
					{
							RawDataContainer.JdMode[i] =  Fields.GetFieldValue( JDBase + i * resolution * numOfFieldEnabled); 
					}// close for loop over Item rows

			}
	
	break ; 
	}// close case RSSI_GS_JdMode_ADC_Util
	
case  "DC_CORRECTION_VIEW" : 
	{	
			///////////////////////////////////////////////////////////////////////////////////////
			// item '15'  in the mask is  Coarse DC I          //
			///////////////////////////////////////////////////////////////////////////////////////
			itemNum= 15 ; 
			if (EnableMask & (1<< itemNum)) //0x08000
			{	 	
					var coarse_dc_I_base  =  baseIndex + 3 + calcNumFieldEn(EnableMask&((1<< itemNum)-1) , MEMC);  
					
					for (var i = 0 ; i < actual_len ; i++) // gets the i'th row 
					{
						RawDataContainer.CoarseDC_I[i] = getDCValFromItem( Fields  , coarse_dc_I_base , i ,numOfFieldEnabled , 22, resolution )  ; 
					}// close for loop over Item rows

			}

			///////////////////////////////////////////////////////////////////////////////////////
			// item '16'  in the mask is  Coarse DC Q          //
			///////////////////////////////////////////////////////////////////////////////////////
			itemNum= 16 ; 
			if (EnableMask & (1<< itemNum)) //  0x10000
			{	 
					var coarse_dc_Q_base  =  baseIndex + 3 + calcNumFieldEn(EnableMask&((1<< itemNum)-1) , MEMC);  
					
					for (var i = 0 ; i < actual_len ; i++) // gets the i'th row 
					{
						RawDataContainer.CoarseDC_Q[i]  = getDCValFromItem( Fields  , coarse_dc_Q_base , i ,numOfFieldEnabled , 22, resolution)  ; 
					}// close for loop over Item rows

			}

			///////////////////////////////////////////////////////////////////////////////////////
			// item '17'  in the mask is  fine DC I          //
			///////////////////////////////////////////////////////////////////////////////////////
			itemNum= 17 ; 
			if (EnableMask & (1<< itemNum)) //0x20000
			{	 
					var fine_dc_I_base  =  baseIndex + 3  + calcNumFieldEn(EnableMask&((1<< itemNum)-1) , MEMC);  
					
					for (var i = 0 ; i < actual_len ; i++) // gets the i'th row 
					{
						RawDataContainer.FineDC_I[i] = getDCValFromItem( Fields  , fine_dc_I_base , i ,numOfFieldEnabled , 28, resolution)  ; 
					}// close for loop over Item rows

			}

			///////////////////////////////////////////////////////////////////////////////////////
			// item '18'  in the mask is  fine DC Q          //
			///////////////////////////////////////////////////////////////////////////////////////
			itemNum= 18 ; 
			if (EnableMask & (1<< itemNum))  //0x40000
			{	 
					var fine_dc_Q_base  =  baseIndex + 3  + calcNumFieldEn(EnableMask&((1<< itemNum)-1) , MEMC);  
					for (var i = 0 ; i < actual_len ; i++) // gets the i'th row 
					{
							RawDataContainer.FineDC_Q[i] = getDCValFromItem( Fields  , fine_dc_Q_base , i  , numOfFieldEnabled , 28, resolution)  ; 
					}// close for loop over Item rows
			}
	break ; 
	}// close case DC_CORRECTION
		
		
case "DVGA_AGC" :	
	{	
		///////////////////////////////////////////////////////////////////////////////////////
		// item '12'  in the mask is  Dvga gain          //
		///////////////////////////////////////////////////////////////////////////////////////
		itemNum= 12 ; 
		if (EnableMask & (1<< itemNum)) //0x01000
		{	 
				
				var Log2DvgaGainQ12_base  =  baseIndex + 3  + calcNumFieldEn(EnableMask &((1<< itemNum)-1) , MEMC);  

				for (var i = 0 ; i < actual_len ; i++) // gets the i'th row 
				{
						var rawVal = Fields.GetFieldValue( Log2DvgaGainQ12_base + i * resolution * numOfFieldEnabled); 
		            	RawDataContainer.Log2DvgaGain[i] = makeSigned(rawVal , 16) / 4096 ; 
			
			
				}// close for loop over Item rows

		}	
	
	    ///////////////////////////////////////////////////////////////////////////////////////
		// item '13'  in the mask is  Log2EeQ6          //
		///////////////////////////////////////////////////////////////////////////////////////
		itemNum= 13 ; 
		if (EnableMask &   (1<< itemNum) )  // 0x02000
		{	 
				
				var Log2EeQ6_base  =  baseIndex + 3  + calcNumFieldEn(EnableMask & ((1<< itemNum)-1) , MEMC);  

				for (var i = 0 ; i < actual_len ; i++) // gets the i'th row 
				{
						RawDataContainer.Log2Ee[i] = Fields.GetFieldValue( Log2EeQ6_base + i * resolution * numOfFieldEnabled)/64; 
				}// close for loop over Item rows

		}	
	break ;
	}// close case DVGA_AGC

case "FFTAndCHEST"  :	
	{	
		///////////////////////////////////////////////////////////////////////////////////////
		// item '21'  in the mask is  constellation          //
		///////////////////////////////////////////////////////////////////////////////////////
		itemNum= 21 ; 
		if (EnableMask & (1<< itemNum)) 
		{	 
				var fft_out_base  =  baseIndex + 3  + calcNumFieldEn(EnableMask &((1<< itemNum)-1) , MEMC);  

				for (var i = 0 ; i < actual_len ; i++) // gets the i'th row 
				{
		            	RawDataContainer.fft_out_I[i] =  makeSigned( Fields.GetFieldValue( fft_out_base + i * resolution * numOfFieldEnabled ),16); 
		            	RawDataContainer.fft_out_Q[i] =  makeSigned( Fields.GetFieldValue( fft_out_base + i * resolution * numOfFieldEnabled + 1),16); 
			
				}// close for loop over Item rows

		}	
	
	    ///////////////////////////////////////////////////////////////////////////////////////
		// item '22'  in the mask is  Log2EeQ6          //
		///////////////////////////////////////////////////////////////////////////////////////
		itemNum= 22 ; 
		if (EnableMask &   (1<< itemNum) )  // 0x02000
		{	 
				var ChEst_base  =  baseIndex + 3  + calcNumFieldEn(EnableMask & ((1<< itemNum)-1) , MEMC);  

				for (var i = 0 ; i < actual_len ; i++) // gets the i'th row 
				{
						RawDataContainer.ChEst_I[i] = makeSigned(Fields.GetFieldValue( ChEst_base + i * resolution * numOfFieldEnabled),16); 
		            	RawDataContainer.ChEst_Q[i] = makeSigned(Fields.GetFieldValue( ChEst_base + i * resolution * numOfFieldEnabled + 1),16); 
				}// close for loop over Item rows

		}	
	break ;
	}// close case CONSTELATION

case "ZFCE_VIEW"  :	
	{	
		///////////////////////////////////////////////////////////////////////////////////////
		// item '21'  in the mask is  constellation          //
		///////////////////////////////////////////////////////////////////////////////////////
		itemNum= 2 ; 
		if (EnableMask & (1<< itemNum)) 
		{	 
				var zfce_base  =  baseIndex + 3  + calcNumFieldEn(EnableMask &((1<< itemNum)-1) , MEMC);  

				for (var i = 0 ; i < actual_len ; i++) // gets the i'th row 
				{
		            	RawDataContainer.zfce[i] =   Fields.GetFieldValue( zfce_base + i * resolution * numOfFieldEnabled ) / 65535 ; 
				}// close for loop over Item rows

		}	
	break ;
	}// close case CONSTELATION


	}//close switch 
}// close function  getPeriodicRawData

/////////////////////////////////////////////////////////////////////////////////////////////////
function getDCValFromItem( Fields  , baseIdx , i ,numOfFieldEnabled , NumOfRepresentationBits ,resolution )  
{
	var MSB = Fields.GetFieldValue( baseIdx + i * resolution * numOfFieldEnabled); 
	var LSB = Fields.GetFieldValue( baseIdx + i * resolution * numOfFieldEnabled + 1 ); 
	var rawVal = (MSB<<16  | LSB) ; 
	return   makeSigned(rawVal , NumOfRepresentationBits ) ;
}
 /////////////////////////////////////////////////////////////////////////////////
 function getRawDataFromEvent(  Item , EventID   ) 
{

var Fields = Item.GetItemFields();
if (Fields == null) {return ;   }
switch (EventID )
{
case "ACQ_DONE_STATUS" : 

    RawDataContainer.Acq_status        =( Fields.GetFieldValue( 0 )== 0) ? "SUCCESS" : "FAIL" ;
	RawDataContainer.frequency_div10   = Fields.GetFieldValue( 1 );
	RawDataContainer.freq_mhz          = RawDataContainer.frequency_div10 / 1e05;
	
	if (RawDataContainer.Acq_status == "SUCCESS" ) 
	{
		RawDataContainer.bw                = Fields.GetFieldValueText( 2 );
		RawDataContainer.mode              = Fields.GetFieldValue( 3 );
		RawDataContainer.guard             = Fields.GetFieldValueText( 4 );
		RawDataContainer.code_rate_str      = Fields.GetFieldValueText( 5 );
		RawDataContainer.modulation_type   = Fields.GetFieldValueText( 6 );
	
		RawDataContainer.interleaver_length = Fields.GetFieldValue( 7 );
		RawDataContainer.acq_duration      = Fields.GetFieldValueText( 8 );
		RawDataContainer.rdsp_state        = Fields.GetFieldValueText( 9 );
	}else{
	    RawDataContainer.bw                = "---" ; 
		RawDataContainer.mode              = "---" ; 
		RawDataContainer.guard             = "---" ; 
		RawDataContainer.code_rate_str     = "---" ; 
		RawDataContainer.modulation_type   = "---" ; 
		RawDataContainer.interleaver_length = "---" ; 
		RawDataContainer.acq_duration      = "---" ; 
		RawDataContainer.rdsp_state        = "---" ; 
	}
	
	
	
	
case 777 : 
 {
 
 }
}// close switch
	
}// close function getRawDataFromEvent 
/////////////////////////////////////////////////////////////////////////////////
function processPeriodicRawData( VIEW_NAME , len)
{
periodicGraphData.XaxisData = RawDataContainer.XaxisData ; // no need for any processing

	if ( RawDataContainer.ACQ_state != undefined)
			{
				if (RawDataContainer.ACQ_state == ACQ_State_DC_WU  && dc_wu_cnt <1 )
				{
					periodicGraphData.XaxisData[0] = dc_wu_cnt++ ; 
				}else{
					dc_wu_cnt = -15; 
				}
				

			}
switch (VIEW_NAME)
{
case   "RSSI_GS_JdMode_ADC_Util"  : 
{

		periodicGraphData.GainState = RawDataContainer.GainState ; // no need for any processing	

//		var TwoLog2sqrt2GadcVadcmax = 2* log2(Math.sqrt(2) * AcqStruct.adc_gain  * AcqStruct.Vadc_max) ; 
       var TwoLog2sqrt2GadcVadcmax = RawDataContainer.DigitalGainFactor ; 

		for (var i = 0 ; i <  len  ; i++) // gets the i'th row 
		{ 
				periodicGraphData.JdMode[i] = (RawDataContainer.JdMode[i] == 0 ?   2 : 1) ;  
				var curr_AbsoluteGainDb                  = ConvertGain2dB( GetCurrentGainFromState(RawDataContainer.GainState[i]  ) ) ; 
				var Log2GainIncrTh                      = GetCurrentIncerTh(RawDataContainer.GainState[i] ,  periodicGraphData.JdMode[i]  ) ; 
				var Log2GainDecrTh                      = GetCurrentDecrTh(RawDataContainer.GainState[i]  ,  periodicGraphData.JdMode[i] ) ; 

				//periodicGraphData.curr_AdcLevel[i]        = TenDivLog2Of10*( RawDataContainer.log2EeDvgaInp[i] - TwoLog2sqrt2GadcVadcmax )  ; 
				periodicGraphData.curr_GainIncerThDb[i]   = TenDivLog2Of10 * ( Log2GainIncrTh  - TwoLog2sqrt2GadcVadcmax ) ; 
				periodicGraphData.curr_GainDecrThDb[i]    = TenDivLog2Of10 * ( Log2GainDecrTh  - TwoLog2sqrt2GadcVadcmax ) ;
	            periodicGraphData.status_rssi[i]          =  ConvertFullScaleToRSSI(RawDataContainer.AdcLevel,curr_AbsoluteGainDb);
	                 
		}// close for loop 

 break ; 
} // end case Dealing with RSSI_GS_JdMode_ADC_Util 

case "DC_CORRECTION_VIEW" : 
{
	    	var Gadc_dc  = AcqStruct.adc_gain/1000 ; 
			var Gdac     = getGdacFromChipType() ;
	
			// Pre-calculations in order to get better performance
			var Gdac_tmp = Gdac / 16384 ; 
			
			//var MinusLog2FineDcGain = 14 ; 
			
			if (RawDataContainer.ACQ_state != undefined && RawDataContainer.ACQ_state <=1) 
			{
				var MinusLog2FineDcGain = RawDataContainer.MinusLog2FineDcWuGain  ; 
			}else{
				var MinusLog2FineDcGain =RawDataContainer.MinusLog2FineDcSsGain  ; 
			}
			
			var Gadc_dcTwoPwerMinusLog2FineDcGain  = (Gadc_dc * Math.pow(2,MinusLog2FineDcGain))
	
			for (var i = 0 ; i < len ; i++) // gets the i'th row 
			{ 
					RawDataContainer.CoarseDC_I[i]  = RawDataContainer.CoarseDC_I[i] * Gdac_tmp ; 
					RawDataContainer.CoarseDC_Q[i]  = RawDataContainer.CoarseDC_Q[i] * Gdac_tmp ; 
					
					RawDataContainer.FineDC_I[i]    = RawDataContainer.FineDC_I[i]/  Gadc_dcTwoPwerMinusLog2FineDcGain; 
					RawDataContainer.FineDC_Q[i]    = RawDataContainer.FineDC_Q[i]/ Gadc_dcTwoPwerMinusLog2FineDcGain ; 
					
			}// close for loop 

	break ;    
}// end case Dealing with DC Offset

case "DVGA_AGC" : 
 {
           
            periodicGraphData.AgcSetPointDb =  TenDivLog2Of10* Log2AgcSetPointQ6 / 64 ; 
              

			for (var i = 0 ; i <len; i++) // gets the i'th row 
			{ 
					periodicGraphData.DvgaOutPwrDb[i] = TenDivLog2Of10 * RawDataContainer.Log2Ee[i] ;              // output
					periodicGraphData.DvgaGainDb[i]   = 2*TenDivLog2Of10 * RawDataContainer.Log2DvgaGain[i]  ;  //input
					
			}// close for loop 
		 
		 break ; 
	} // close case DVGA_AGC

case "FFTAndCHEST_Constellation" : 
 {
			for (var i = 0 ; i <len ; i++) // gets the i'th row 
			{ 
					var FftOutI = RawDataContainer.fft_out_I[i] ; 
					var FftOutQ = RawDataContainer.fft_out_Q[i] ; 
					var ChEstI = RawDataContainer.ChEst_I[i] ;
					var ChEstQ = RawDataContainer.ChEst_Q[i];
					var denominator = ChEstQ*ChEstQ+ ChEstI*ChEstI ;  
					
					if (denominator == 0 ) {	 continue; 		 }
			 
					periodicGraphData.ConstPointI[i] = (FftOutI*ChEstI + FftOutQ*ChEstQ)/denominator  ; 
					periodicGraphData.ConstPointQ[i]   =  (FftOutQ*ChEstI -FftOutI*ChEstQ)/denominator  ; 
					
			}// close for loop 
			
			
	} // close case FFTAndCHEST_Constelation

case "FFTAndCHEST_PhaseAmplitude" : 
 {

			for (var i = 0 ; i <len; i++) // gets the i'th row 
			{ 
				var FftOutI = RawDataContainer.fft_out_I[i] ; 
				var FftOutQ = RawDataContainer.fft_out_Q[i] ; 
				var ChEstI = RawDataContainer.ChEst_I[i] ;
				var ChEstQ = RawDataContainer.ChEst_Q[i];
				
			 
				periodicGraphData.FFTAmplitude[i]       = FftOutI*FftOutI + FftOutQ*FftOutQ ; 
				periodicGraphData.FFTPhase[i]           =  Math.atan2( FftOutQ , FftOutI) * 180 / Math.PI ;  
				periodicGraphData.ChEstAmplitude[i]     = ChEstI*ChEstI + ChEstQ*ChEstQ ; 
				periodicGraphData.ChEstPhase[i]         = Math.atan2(ChEstQ , ChEstI)* 180 / Math.PI ; 
					
			}// close for loop 
			
			
	break ; 
	} // close case FFTAndCHEST_PhaseAmplitude   
	
	}// close switch
}//close function  processRawDataContainer  ()

///////////////////////////////////////////////////////////////////////////
 function   ConvertFullScaleToRSSI(AdcLevel ,AbsoluteGainDb )
{
	if (AdcLevel=="-Inf")
	 {
	return "-Inf" ; 
	}
	
	
	return  AdcLevel  - AbsoluteGainDb + RawDataContainer.BwCorrectionFactorDb + AcqStruct.Padc_max ; 
}
///////////////////////////////////////////////////////////////////////////

function getGdacFromChipType() 
{

switch ( RawDataContainer.RF_chip_type)
	{
		case "Fury A0" :
		case "Fury B0" :
            //return 1  ;
			return 0.8  ; 

		case "Tomahawk B0" :
			return 0.5  ; 
		default :
		{   
		 //  ask_For_L1_AcqStatus(); 
		    return null ; //0.8  ;
	  
		   // alert("undetected chip type");
			//debugger; 
		}
	}// close switch case	
	
}// close function 
/////////////////////////////////////////////////////////////////////////////////

function sumBits(EnableMask)
{
var cnt = 0 ;

for (var i = 0 ; i < 32 ; i++)
{
cnt += ((gNumToAnd[i] & EnableMask) != 0  ) ; // increase cnt by one in case the bit mask is not zero
}// close for loop over the bits
 
 return cnt; 

}//close function  sumBits()
/////////////////////////////////////////////////////////////////////////////////
function  calcNumFieldEn(EnableMask , MEMC)
{
	var numOfFieldEnabled   = 0 ; 

	for (var i = 0 ; i < 32 ; i++)
	{

		if ((gNumToAnd[i] & EnableMask) != 0  ) 
		{
			numOfFieldEnabled++ ; 
			numOfFieldEnabled+= ((MEMC & gNumToAnd[i])== gNumToAnd[i] ) ? 1 :0  ; 
		}
	}// close for loop over the 32 bit items index
	
	return numOfFieldEnabled ; 
}//close function   calcNumFieldEn()


/////////////////////////////////////////////////////////////////////////////////
function ProcessStatusData()
{
StatusGraphData = new Object(); 
StatusGraphData.statusGraphDataIsReady = false ; 		

			RawDataContainer.NumPreViterbiBits = RawDataContainer.NumViterbiPkts * 1632 / RawDataContainer.code_rate_val ;
			StatusGraphData.NumPreViterbiBits =  RawDataContainer.NumPreViterbiBits ; 
			StatusGraphData.NumPreViterbiBitErrs =  RawDataContainer.NumPreViterbiBitErrs ; 
		
		if ( ! RawDataContainer.firstTime) 
		   {
			StatusGraphData.NumPreViterbiBitsDelta  = 	RawDataContainer.NumPreViterbiBits - RawDataContainer.NumPreViterbiBits_prev ; 
			
			var NumPreViterbiBitErrsDelta = RawDataContainer.NumPreViterbiBitErrs  - RawDataContainer.NumPreViterbiBitErrs_prev ; 
		   
			StatusGraphData.PreViterbiBerHw = (StatusGraphData.NumPreViterbiBitsDelta  > 0 ) ?  NumPreViterbiBitErrsDelta / StatusGraphData.NumPreViterbiBitsDelta  : 0 ; 
			StatusGraphData.PreViterbiBerFw =  RawDataContainer.AveragePreViterbiBER; ;
			StatusGraphData.PreViterbiBerTotal  = RawDataContainer.NumPreViterbiBitErrs / RawDataContainer.NumPreViterbiBits ;  
			
			StatusGraphData.AverageViterbiBer =   RawDataContainer.AverageViterbiBer ;
			StatusGraphData.InstViterbiBer =   RawDataContainer.InstViterbiBer;
			
			StatusGraphData.NumRsPkts = RawDataContainer.NumRsPkts ; 
			StatusGraphData.NumRSTrashPkts =  RawDataContainer.NumRSTrashPkts ; 
			StatusGraphData.NumRsPktsDelta = RawDataContainer.NumRsPkts - RawDataContainer.NumRsPkts_prev ; 
			
			var NumRsTrashPktsDelta = RawDataContainer.NumRSTrashPkts  - RawDataContainer.NumRSTrashPkts_prev ;  

			StatusGraphData.RsPer                   =  (NumRsTrashPktsDelta >0 ) ? NumRsTrashPktsDelta/StatusGraphData.NumRsPktsDelta : 0 ; 
			StatusGraphData.RsPerTotal              = RawDataContainer.NumRSTrashPkts  / RawDataContainer.NumRsPkts   ; //?? TODO Do i need it ? 
			
			StatusGraphData.EsrTotalSecDelta        = RawDataContainer.ESR_Total_Seconds - RawDataContainer.ESR_Total_Seconds_prev  ; 
			var ESRErrSecDelta          = RawDataContainer.ESR_Erroneous_Seconds - RawDataContainer.ESR_Erroneous_Seconds_prev  ; 
			
			StatusGraphData.ESR     = (StatusGraphData.EsrTotalSecDelta > 0 ) ?  (ESRErrSecDelta / StatusGraphData.EsrTotalSecDelta) :  0  ; 
			
	         StatusGraphData.ESR_Total_Seconds     = RawDataContainer.ESR_Total_Seconds ; 
			 StatusGraphData.ESR_Erroneous_Seconds = RawDataContainer.ESR_Erroneous_Seconds ;           
	        StatusGraphData.EsrTotal = 	RawDataContainer.ESR_Erroneous_Seconds /RawDataContainer.ESR_Total_Seconds   ;
			
			StatusGraphData.XaxisData = RawDataContainer.XaxisData ; 
			
			RawDataContainer.firstTime = false  ;	
			StatusGraphData.statusGraphDataIsReady = true ; 	 
		  }
	
	RawDataContainer.firstTime = false  ; 
	RawDataContainer.NumPreViterbiBits_prev     = RawDataContainer.NumPreViterbiBits ; // saves the data for the next iteration
	RawDataContainer.NumPreViterbiBitErrs_prev  = RawDataContainer.NumPreViterbiBitErrs ; 
	RawDataContainer.NumRsPkts_prev             = RawDataContainer.NumRsPkts     ;  // saves the data for the next iteration
	RawDataContainer.NumRSTrashPkts_prev        = RawDataContainer.NumRSTrashPkts ;// saves the data for the next iteration
	RawDataContainer.NumRSTrashPkts_prev        = RawDataContainer.NumRSTrashPkts ;// saves the data for the next iteration
	RawDataContainer.ESR_Erroneous_Seconds_prev = RawDataContainer.ESR_Erroneous_Seconds ; 
	RawDataContainer.ESR_Total_Seconds_prev     =  RawDataContainer.ESR_Total_Seconds ; 

return 		StatusGraphData ; 
}
/////////////////////////////////////////////////////////////////////////////////
function onclickMarkAllEvent()
{

	markAllEventsAs(true);
}

function onRemoveAll()
{
	markAllEventsAs(false);
}

/////////////////////////////////////////////////////////////////////////////////////////////


function markAllEventsAs( val)
{    
	switch (selectedTechnology)
	{
		case "ISDB-T" :
		{
			EVENT_DTV_L1_POWERUP.checked = val; 
			EVENT_DTV_L1_POWERDOWN.checked  = val;
			EVENT_DTV_L1_SOFT_RESET.checked  = val;
			L1_ENTER_RECOVERY.checked = val;
			TRAFFIC_STARTED.checked  = val;
			//L1_ACQ_SUCCESS.checked  = val;
			//L1_ACQ_FAILED.checked = val;
		//	RF_TUNE_FAIL.checked = val;
			//RF_TUNE_SUCCESS.checked = val;
			BAD_FRAME_RECEIVED.checked =val;
		//	L3L1Interface.checked  = val;
			//EVENT_DTV_L1_STATE_CHANGE.checked  = val;
			EVENT_DTV_L3_L1_POWERUP_CMD.checked  = val;
			EVENT_DTV_L3_L1_POWERUP_CMD.checked= val;
			EVENT_DTV_L3_L1_POWERDOWN_CMD.checked= val;
			EVENT_DTV_L3_L1_ACQ_CMD.checked= val;
			EVENT_DTV_L1_L3_TRAFFIC_ON_NOTIFY.checked= val;
			EVENT_DTV_L1_L3_TRAFFIC_LOST_NOTIFY.checked= val;
			EVENT_DTV_L1_L3_ACQ_SUCCESS.checked= val;
			EVENT_DTV_L1_L3_ACQ_FAILURE.checked= val;
			L1TMCC_FAILURE.checked= val;
			EVENT_DTV_L1_MODEM_FAILURE.checked= val;
			RF_ANALOG_JD_MODE_CHANGE.checked= val;
			EVENT_MBP_RF_ANALOG_JD_INT.checked = val ; 
			break ; 
		}	
		case "DVB-H" :
		{
			eventListSleep.checked = val;
			eventListSnooze.checked = val;
			eventListOnline.checked = val;
			eventListPlatformAcqSuccess.checked = val;
			eventListCEStateChange.checked = val;
			eventListTableAcqSuccess.checked = val;
			eventListL1AcqSuccess.checked = val;
			eventListL3InitSuccess.checked = val;
			eventListSignalLost.checked = val;
			break; 
		}	
		case "CMMB" :
		{
		cb_CALL_ACTIVATE.checked = val;
		cb_CALL_DEACTIVATE.checked = val;
		cb_CALL_TUNE.checked = val;
		cb_CALL_SELECT_SERVICE.checked = val;
		cb_CALL_DESELECT_SERVICE.checked = val;
		cb_NOTIFICATION_ACTIVATE.checked = val;
		cb_NOTIFICATION_DEACTIVATE.checked = val;
		cb_NOTIFICATION_TUNE.checked = val;
		
		cb_NOTIFICATION_SELECT_SERVICE.checked = val;
		cb_NOTIFICATION_DESELECT_SERVICE.checked = val;
		cb_NOTIFICATION_AUTHORIZATION_FAILURE.checked = val;
		cb_NOTIFICATION_EMERGENCY_BROADCASTING_TRIGGER.checked = val;
		cb_NOTIFICATION_EMERGENCY_BROADCASTING_MSG.checked = val ; 
		cb_NOTIFICATION_AUTHORIZATION_FAILURE.checked = val;
		
		cb_CAS_INITIALIZED.checked = val;
		cb_CAS_EMM_RECEIVED.checked = val;
		cb_CAS_ECM_RECEIVED.checked = val;
		cb_AUDIO_OVERFLOW.checked = val;
		cb_AUDIO_UNDERFLOW.checked = val;
		cb_VIDEO_UNDERFLOW.checked = val;
		cb_VIDEO_OVERFLOW.checked = val;
		
		}	// close case CMMB
	}// close switch
}//close function markAllEventsAs

/////////////////////////////////////////////////////////////////////////////////////////////

   
function  Add_ISDBT_Evets()
{
  ClientObject.AddEvent(EVENT_POWERUP);  //EVENT_DTV_L1+POWER_UP
  ClientObject.AddEvent(EVENT_POWERDOWN);  //EVENT_DTV_L1+POWER_down
  ClientObject.AddEvent(EVENT_SOFT_RESET);  //EVENT_DTV_L1+soft_reset
  ClientObject.AddEvent(EVENT_STATE_CHANGE);  //EVENT_DTV_L1+state_change
  ClientObject.AddEvent(EVENT_ACQ_TUNE_STATUS);  //EVENT_DTV_L1_tune_done
  ClientObject.AddEvent(EVENT_ACQ_DONE_STATUS);  //EVENT_DTV_L1+acquisition_done
  ClientObject.AddEvent(1510);  //EVENT_DTV_L1+acqusition failed
  ClientObject.AddEvent(EVENT_TRAFFIC_STARTED);  //EVENT_DTV_L1+traffic started
  ClientObject.AddEvent(EVENT_DTV_L1_BAD_FRAME_RECEIVED);  //EVENT_DTV_L1+bad frame(trashed packets)
  ClientObject.AddEvent(EVENT_DTV_L1_TMCC_FAILURE);  //EVENT_DTV_L1+bad frame(parsing error)
  ClientObject.AddEvent(EVENT_DTV_L1_RECOVERY_STATUS);  //EVENT_DTV_L1+recovery (exit/enter)
  ClientObject.AddEvent(EVENT_DTV_L1_L3_API_COMMAND);  //EVENT_DTV_L1+L3 API command
  ClientObject.AddEvent(EVENT_DTV_L1_MODEM_FAILURE);  //modem failure
  ClientObject.AddEvent(EVENT_MBP_RF_ANALOG_JD_MODE_CHANGE);  //RF_ANALOG_JD_MODE_CHANGE 
  ClientObject.AddEvent(EVENT_MBP_RF_ANALOG_JD_INT);  //EVENT_MBP_RF_ANALOG_JD_INT 
}

/////////////////////////////////////////////////////////////////////////////////////////////


function populateEventForGraph(Item, graph , additional_param)
{
    if(AnnotationId > MAX_EVENTS)
   {
      graph.RemoveAllAnnotations();
   }

    graph.Channel(dummy_ch_idx).AddXY(Item.GetItemSpecificTimestamp2(), graph.Yaxis(0).Min); //just to make the graph to move in time. User will not see any data
	
    var eventName = Item.GetItemName();
	
	if( selectedTechnology == "DVB-H" )
	{
		populateDVBHEvent(eventName, Item, graph);
	}
	if( selectedTechnology == "ISDB-T") 
	{
		populateISDBTEvent(eventName, Item, graph);
	}
	if( selectedTechnology == "CMMB") 
	{
		populateCMMBEvent(GetItemID(Item), Item, graph , additional_param);
	}

}

/////////////////////////////////////////////////////////////////////////////////////////////

function populateCMMBEvent(ItemID, Item, graph , av_over_under)
{

var Fields = Item.GetItemFields();
 	if (Fields == null) {return ;   }
 				
   if (av_over_under != undefined) {
   
		if( av_over_under == AUDIO_OVERFLOW && cb_AUDIO_OVERFLOW.checked )
		{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, RED ,"Audio OverFlow");				
		return;
		}

		if( av_over_under == AUDIO_UNDERFLOW && cb_AUDIO_UNDERFLOW.checked )
		{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, RED,"Audio UnderFlow");				
		return;
		}

		if( av_over_under == VIDEO_OVERFLOW && cb_VIDEO_OVERFLOW.checked )
		{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, LIGHT_BLUE,"Video OverFlow");				
		return;
		}

		if( av_over_under == VIDEO_UNDERFLOW && cb_VIDEO_UNDERFLOW.checked )
		{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, LIGHT_BLUE,"Video UnderFlow");				
		return;
		}

}// case av_over_under defined

 

    if( ItemID == EVENT_DTV_CMMB_API_CALL_ACTIVATE && cb_CALL_ACTIVATE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, BROWN,"Call Activate");				
		return;
	}

		if( ItemID == EVENT_DTV_CMMB_API_NOTIFICATION_ACTIVATE && cb_NOTIFICATION_ACTIVATE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, BROWN,"Notif' Activate");				
		return;
	}
	
	if( ItemID == EVENT_DTV_CMMB_API_CALL_DEACTIVATE && cb_CALL_DEACTIVATE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, BROWN,"Call De-Activate");				
		return;
	}
	if( ItemID == EVENT_DTV_CMMB_API_NOTIFICATION_DEACTIVATE && cb_NOTIFICATION_DEACTIVATE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, BROWN,"Notif' De-Activate");				
		return;
	}


	if( ItemID == EVENT_DTV_CMMB_API_CALL_TUNE && cb_CALL_TUNE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, ORENGE,"Call Tune");				
		return;
	}
	
	if( ItemID == EVENT_DTV_CMMB_API_CALL_SELECT_SERVICE && cb_CALL_SELECT_SERVICE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, GREEN,"Call Select Service");				
		return;
	}

	if( ItemID == EVENT_DTV_CMMB_API_CALL_DESELECT_SERVICE && cb_CALL_DESELECT_SERVICE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, GREEN,"Call De-Select Service");				
		return;
	}


		if( ItemID == EVENT_DTV_CMMB_API_NOTIFICATION_TUNE && cb_NOTIFICATION_TUNE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, ORENGE,"Notif' Tune");				
		return;
	}
		if( ItemID == EVENT_DTV_CMMB_API_NOTIFICATION_SELECT_SERVICE && cb_NOTIFICATION_SELECT_SERVICE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, GREEN,"Notif' Select Service");				
		return;
	}
		if( ItemID == EVENT_DTV_CMMB_API_NOTIFICATION_DESELECT_SERVICE && cb_NOTIFICATION_DESELECT_SERVICE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, GREEN,"Notif' De-Select Service");				
		return;
	}
		if( ItemID == EVENT_DTV_CMMB_API_NOTIFICATION_AUTHORIZATION_FAILURE && cb_NOTIFICATION_AUTHORIZATION_FAILURE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, YELLOW,"Notif' Authorization Failure");				
		return;
	}


if( ItemID == EVENT_DTV_CMMB_API_NOTIFICATION_EMERGENCY_BROADCASTING_TRIGGER && cb_NOTIFICATION_EMERGENCY_BROADCASTING_TRIGGER.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, TEAL,"Notif' Emergency Trigger");				
		return;
	}
		if( ItemID == EVENT_DTV_CMMB_API_NOTIFICATION_EMERGENCY_BROADCASTING_MESSAGE && cb_NOTIFICATION_EMERGENCY_BROADCASTING_MSG.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, TEAL,"Notif' Emergency Msg ");				
		return;
	}
	
	if( ItemID == EVENT_DTV_CMMB_CAS_INITIALIZED && cb_CAS_INITIALIZED.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, TURQUOISE,"CAS Init");				
		return;
	}
	if( ItemID == EVENT_DTV_CMMB_CAS_EMM_RECEIVED_AND_PROCESSED && cb_CAS_EMM_RECEIVED.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, LAVENDER,"CAS EMM received");				
		return;
	}
	
	if( ItemID == EVENT_DTV_CMMB_CAS_ECM_RECEIVED_AND_PROCESSED && cb_CAS_ECM_RECEIVED.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, TURQUOISE,"CAS ECM received");				
		return;
	}
}
/////////////////////////////////////////////////////////////////////////////////////
function populateISDBTEvent(eventName, Item, graph)
{
 	var Fields = Item.GetItemFields();
 	if (Fields == null) {return ;   }
 				

    if( eventName == "EVENT_DTV_L1_POWERUP" && EVENT_DTV_L1_POWERUP.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, YELLOW,"L1 PowerUP");				
		return;
	}
    if( eventName == "EVENT_DTV_L1_POWERDOWN" && EVENT_DTV_L1_POWERDOWN.checked )
	{	    
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, BROWN,"L1 PowerDown");		
		return;
	}
    if( eventName == "EVENT_DTV_L1_SOFT_RESET" && EVENT_DTV_L1_SOFT_RESET.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, TAN,"L1 Soft Reset");		
		return;
	}
	 if( eventName == "EVENT_DTV_L1_RECOVERY_STATUS" &&  L1_ENTER_RECOVERY.checked )
	{
		
		var status = Fields.GetFieldValue(0) ;
		var retry =  Fields.GetFieldValue(1) ;
		
		if( status == 0 && retry ==1 &&  L1_ENTER_RECOVERY.checked )		
			addAnnotation(Item.GetItemSpecificTimestamp2(), graph,LIME ,"L1 Enter Recovery");		
	
		return;
	}
	
	if( eventName == "EVENT_DTV_L1_TRAFFIC_STARTED" &&  TRAFFIC_STARTED.checked )
	{
		
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph,SEA_GREEN,"L1 Traffic Started");	
		return;
	}
	
	if( (eventName == "EVENT_DTV_L1_ACQ_DONE" ) ||(eventName == "EVENT_DTV_L1_ACQ_DONE_STATUS" )/*&& ( L1_ACQ_SUCCESS.checked  || L1_ACQ_FAILED.checked)*/)
	{
      /*  // success = 0 means that acquisition succeeded, otherwise the field is non-zero				
		var success = Fields.GetFieldValue(0) ;
		
		if( success != 0 &&  L1_ACQ_FAILED.checked )		
			addAnnotation(Item.GetItemSpecificTimestamp2(), graph, BLUE);	
		if( success == 0 && L1_ACQ_SUCCESS.checked )
			addAnnotation(Item.GetItemSpecificTimestamp2(), graph, TURQUOISE);	
		*/
		return;
    }
    
    if( eventName == "EVENT_DTV_L1_ACQ_TUNE_STATUS" /* && ( RF_TUNE_FAIL.checked  || RF_TUNE_SUCCESS.checked) */)
	{
		/*
		var success = Fields.GetFieldValue(0) ;		
		if( success != 0  &&  RF_TUNE_FAIL.checked )		
			addAnnotation(Item.GetItemSpecificTimestamp2(), graph, PLUM);	
		if( success == 0 && RF_TUNE_SUCCESS.checked )
			addAnnotation(Item.GetItemSpecificTimestamp2(), graph, ORENGE);	
			*/
		return;
    }
		
    if(  eventName=="EVENT_DTV_L1_TMCC_FAILURE" && L1TMCC_FAILURE.checked )
	{

		addAnnotation(Item.GetItemSpecificTimestamp2(), graph,LAVENDER,"TMCC Fail");		
		return;
	}
    
   if(  eventName == "EVENT_DTV_L1_BAD_FRAME_RECEIVED"  && BAD_FRAME_RECEIVED.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph,RED,"L1_BAD_FRAME_RECEIVED");		
		return;
	}

    //if( eventName == "EVENT_DTV_L1_L3_API_COMMAND" && L3L1Interface.checked )    
    if( eventName == "EVENT_DTV_L1_L3_API_COMMAND"  )
	{
		
		var cmd = Fields.GetFieldValue(0) ;		
		
		switch(cmd) 
		{
		case 0:// L3->L1 Acq cmd
			if (EVENT_DTV_L3_L1_ACQ_CMD.checked ) addAnnotation(Item.GetItemSpecificTimestamp2(), graph, AQUA,"L3->L1:Acq");	
			break;
		case 1: // L3->L1 power up cmd
			if (	EVENT_DTV_L3_L1_POWERUP_CMD.checked) addAnnotation(Item.GetItemSpecificTimestamp2(), graph, LIGHT_ORENGE , "L3->L1:PowerUp");	
			break;
		case 2:
			 if(EVENT_DTV_L3_L1_POWERDOWN_CMD.checked) addAnnotation(Item.GetItemSpecificTimestamp2(), graph, ROSE,"L3->L1:PowerDown");	
			break;
		case 3:
		    if(0)addAnnotation(Item.GetItemSpecificTimestamp2(), graph, LIGHT_ORENGE);	
			break;
		case 1000:
			if (EVENT_DTV_L1_L3_ACQ_SUCCESS.checked) addAnnotation(Item.GetItemSpecificTimestamp2(), graph, GOLD,"L1->L3:Acq Success");	
			break;
		case 1001:
			if(EVENT_DTV_L1_L3_ACQ_FAILURE.checked)addAnnotation(Item.GetItemSpecificTimestamp2(), graph, WHITE,"L1->L3:Acq Fail");	
			break;
	
		case 1002:
			if(EVENT_DTV_L1_L3_TRAFFIC_LOST_NOTIFY.checked) addAnnotation(Item.GetItemSpecificTimestamp2(), graph, BLUE,"L1->L3:Traffic Lost");	
			break;
		case 1003:
			if(	EVENT_DTV_L1_L3_TRAFFIC_ON_NOTIFY.checked)addAnnotation(Item.GetItemSpecificTimestamp2(), graph, SEA_GREEN,"L1->L3:Traffic ON");	
			break;
		case 1004:	
			if ( 0) addAnnotation(Item.GetItemSpecificTimestamp2(), graph, INDIGO);
				break;
		default:
		}

		return;
		
	}
	
	
	if( eventName == "EVENT_DTV_L1_MODEM_FAILURE" && EVENT_DTV_L1_MODEM_FAILURE.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, PINK,"L1 Modem Fail");		
		return;
	}

  
	if( eventName == "EVENT_MBP_RF_ANALOG_JD_MODE_CHANGE" && RF_ANALOG_JD_MODE_CHANGE.checked )
	{
		
		var JD_mode_n_src  = getRawDataFrom_JD_MODE_CHANGE(Item );
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, GRAY,JD_mode_n_src );	
	}

	if( eventName == "EVENT_MBP_RF_ANALOG_JD_INT" && EVENT_MBP_RF_ANALOG_JD_INT.checked )
	{
		var Frames_remaining =  Fields.GetFieldValue(2) ;
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, BLUE,"analog JD Mode polling " + Frames_remaining);		
		return;
	}

}// close function  populateISDBTEvent
/////////////////////////////////////////////////////////////////////////////////////////////

function getRawDataFrom_ANALOG_JD_INT(Item )
{
var Fields = Item.GetItemFields();
if (Fields == null) {return ;   }
RawDataContainer.WB_int_status = Fields.GetFieldValue(0) ;	
RawDataContainer.NB_int_status = Fields.GetFieldValue(1) ;	
RawDataContainer.Frames_remainig = Fields.GetFieldValue(2) ;	
}


function getRawDataFrom_JD_MODE_CHANGE(Item )
		{
		
		var Fields = Item.GetItemFields();
		if (Fields == null) {return ;   }
		
		RawDataContainer.analog_JD_mode = Fields.GetFieldValue(0) ;	
		var JD_mode_n_src  ; 
		
		if (RawDataContainer.analog_JD_mode ==1) 
		{
			JD_mode_n_src = "analog JD Mode 1" ;	
			return ; 
		}
		
		if (RawDataContainer.analog_JD_mode == 2)
		{
		var source = Fields.GetFieldValueText(1) ;	
		
			/*switch(source) {
			case 0 :
				source = "NB" ; 
				break;
			case 1:
				source = "WB"
				break;
			case 2:
				source = "CHORD"
				break;
			default:
			}
		*/
		}	
		JD_mode_n_src = source ;		
		return JD_mode_n_src;
		}

/////////////////////////////////////////////////////////////////////////////////////////////

function populateDVBHEvent(eventName, Item, graph)
{

	if( eventName == "EVENT_DTV_L1_SLEEP" && eventListSleep.checked )
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, TEAL);		
		return;
	}

	if( eventName == "EVENT_DTV_L1_SNOOZE" && eventListSnooze.checked)
	{
	   addAnnotation(Item.GetItemSpecificTimestamp2(), graph, TURQUOISE);		
		return;
	}

	if( eventName == "EVENT_DTV_L1_ONLINE" && eventListOnline.checked)
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, BLUE);		
		return;
	}

	if( eventName == "EVENT_DTV_DVBH_PLTFM_ACQ_SUCCESS" && eventListPlatformAcqSuccess.checked)
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, BRIGHT_GREEN);		
		return;
	}
	if( eventName == "EVENT_DTV_DVBH_CE_STATE_CHANGED" && eventListCEStateChange.checked)
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, PINK);		
		return;
	}
	if( eventName == "EVENT_DTV_TABLE_ACQ_SUCCESS" && eventListTableAcqSuccess.checked)
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, GREEN);		
		return;
	}
	if( eventName == "EVENT_DTV_L1_ACQ_DONE" && eventListL1AcqSuccess.checked)
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, DARK_BLUE);		
		return;
	}

 	if( eventName == "EVENT_DTV_DVBH_INIT_SUCCESS" && eventListL3InitSuccess.checked)
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, DARK_RED);		
		return;
	}
	if( eventName == "EVENT_DTV_L1_SIGNAL_LOST" && eventListSignalLost.checked)
	{
		addAnnotation(Item.GetItemSpecificTimestamp2(), graph, VIOLET);		
		return;
	}

}

//////////////////////////////////////////////////////////////////////
function addAnnotation(timeStamp, graph, color, txt)
{
	AnnotationId = graph.AddAnnotation();
    graph.Annotation(AnnotationId).Reference = 1;  //channel
	graph.Annotation(AnnotationId).ChannelName = graph.Channel(0).Name
	graph.Annotation(AnnotationId).X = timeStamp;
	graph.Annotation(AnnotationId).Style = 3; //LineX Annotation 1= horizntal Line  , 0 ==text
	graph.Annotation(AnnotationId).PenColor = color;	
	graph.Annotation(AnnotationId).PenStyle = 2;
	graph.Annotation(AnnotationId).PenWidth = 2;	
	

     AnnotationId = graph.AddAnnotation();
    graph.Annotation(AnnotationId).Reference = 1;  //channel
	graph.Annotation(AnnotationId).ChannelName = graph.Channel(0).Name
	graph.Annotation(AnnotationId).X = timeStamp;
	graph.Annotation(AnnotationId).Y = graph.Yaxis(0).Min  + (0.2*((textAnottCnt++)%5) + 0.1 )* graph.Yaxis(0).Span;
		
	graph.Annotation(AnnotationId).Style = 0 ; //3; //LineX Annotation 1= horizntal Line  , 0 ==text
	graph.Annotation(AnnotationId).FontColor = color;	
    graph.Annotation(AnnotationId).Text = txt;	


}


//////////////////////////////////////////////////////////////////////


function makeSigned(value , numOfBits)
{
  
  if(value >=  Math.pow(2,numOfBits - 1 ) )
  {
     value = value - Math.pow(2,numOfBits);
  }
  return value;

}   

//////////////////////////////////////////////////////////////////////
function   Populate_Coarse_Fine_DC_Graphs(  len , curr_GS ) 
{
	for (var i = 0 ; i< len ; i++  )
	{ 
		if ( RawDataContainer.XaxisData[i] == 0 ){		InitDisplay(); 			}		
			coarse_dc_graph.Channel(0).AddXY( RawDataContainer.XaxisData[i],RawDataContainer.CoarseDC_I[i]);  
			coarse_dc_graph.Channel(1).AddXY( RawDataContainer.XaxisData[i], RawDataContainer.CoarseDC_Q[i]);  
		
			fine_dc_graph.Channel(0).AddXY(RawDataContainer.XaxisData[i] ,RawDataContainer.FineDC_I[i]) ;  
			fine_dc_graph.Channel(1).AddXY(RawDataContainer.XaxisData[i] ,RawDataContainer.FineDC_Q [i]) ;  

	

			if (RawDataContainer.ACQ_state != undefined) 
			{
				coarse_dc_graph.Channel(RawDataContainer.ACQ_state + 2).AddXY( RawDataContainer.XaxisData[i], RawDataContainer.CoarseDC_I[i]);  
				coarse_dc_graph.Channel(RawDataContainer.ACQ_state + 2).AddXY( RawDataContainer.XaxisData[i], RawDataContainer.CoarseDC_Q [i]);  

				fine_dc_graph.Channel(RawDataContainer.ACQ_state+ 2).AddXY(RawDataContainer.XaxisData[i] ,RawDataContainer.FineDC_I[i]) ;  
				fine_dc_graph.Channel(RawDataContainer.ACQ_state+ 2).AddXY(RawDataContainer.XaxisData[i] ,RawDataContainer.FineDC_Q[i]) ;  
				if (ShowGainStateChanges.checked)
				{
					Add_GS_Annotation_to_graph(coarse_dc_graph , curr_GS[i]);
					Add_GS_Annotation_to_graph(fine_dc_graph , curr_GS[i]);
				}
			}
			previos_GS = curr_GS[len-1] ;
	

	}// close for loop over the raws
	
	 
}// close function PopulatePeriodicGraphs
//////////////////////////////////////////////////////////////////////

function getNumOfFieldsInSubPkt ( Fields  , subPktBaseIdx )
{
	
	var current_ID =  Fields.GetFieldValue( subPktBaseIdx );
	var subPktVersion = Fields.GetFieldValue( subPktBaseIdx+1 );

	if (current_ID == CFB_SBPKT_ID )
	{
		if (subPktVersion >=2 )
		{
			var K = Fields.GetFieldValue( subPktBaseIdx + 9 );
			var binAckLen =4*(2*K + 1 )   ; 
			return L1NumOfFieldsById[subPktVersion][current_ID] + binAckLen ;  
		}elseif  ( subPktVersion ==1 )
		{
			var binAckLen = 36   ; 
			return L1NumOfFieldsById[subPktVersion][current_ID] + binAckLen ;  
		}
	} // case CFB
	
	if (current_ID == CFA_SBPKT_ID )
	{
			var num_of_averages = Fields.GetFieldValue( subPktBaseIdx + 6 );		
			return L1NumOfFieldsById[subPktVersion][current_ID] + 2*num_of_averages ;  
	
	} // case CFA
	
	
	
	
	return L1NumOfFieldsById[subPktVersion][current_ID] ;  
}




 
		 /////////////////////////////////////////////////////////////////////////////////////////////

/*
function onClickRssiScaleUp()
{
    Rssi_zoom_amplitude*=2 ;  
	RSSI_Graph.Yaxis(0).Span =  Rssi_zoom_amplitude ;  
}

function onClickRssiScaleDown()
{
    Rssi_zoom_amplitude /=2 ;  
	RSSI_Graph.Yaxis(0).Span =  Rssi_zoom_amplitude ;  
}
*/
//////////////////////////////////////////////////////////////////////
function onClickZoomIn()
{
	UpdateGraphsScaleX(1/2);		
}
/////////////////////////////////////////////////////////////////////////////////////////////
function onClickZoomOut()
{

	UpdateGraphsScaleX(2);		
}
//////////////////////////////////////////////////////////////////////
function UpdateGraphsScaleX(zoom_factor)
{	
	
	for ( i = 0 ; i< graph_list.length ; i++ )
	{
	    graph_list[i].Xaxis(0).Span               *= zoom_factor;
	}

}


/*
/*
<input type="button" onclick="myfunction('Good Morning!')" value="In the Morning" ID="Button1" NAME="Button1">
THIS imp is for opening new view from the current view
// Roeec acquisition table 
function myfunction(txt) 
{ 
alert(txt);
Execute();
} 
	<script type="text/jscript" src="QXDMCreateView.wsf"></script>

*/

//////////////////////////////////////////////////////////
// transformation from "send_data 75 44 240 0 cmd param " so SW is as folloews
//"send_data 75 44 240 0" == "DTV/L1 Command Request" in the first argument of the RequestItem(
// cmd is taken from ICD ( 103= powerUp , 100=acq ... )
// for Periodic teh last 4 underlined numbers:
// send_data 75 44 240 0 116 6 _5_1_0_1_
// first revers ==>   1 0 1 5
// put each on in his own BYTE [ 1 ][ 0 ][ 1 ][ 5 ]
// convert each byte to Hex  : [ 0x01 ][ 0x00 ][ 0x01 ][ 0x05 ]
// transform the concatanation to decimal =  16777477
// to disable : 256+ itemNum

////////////////////////////////////////////////////////////////////////////

function ask_For_L1_Versions()
{
	L1_diag_cmd( UBM_L1_ISDB_GET_VERSION_INFO_CMD, "" );
} 
////////////////////////////////////////////////////////////////////////////////////////////////
function ask_For_L1_state()
{

	L1_diag_cmd( UBM_L1_ISDB_GET_CURRENT_STATE_CMD, "" );

}
////////////////////////////////////////////////////////////////////////////////////////////////
function ask_For_L1_AcqStatus()
{ 
  
   L1_diag_cmd( UBM_L1_ISDB_LOG_ACQ_CMD, "" );
}
////////////////////////////////////////////////////////////////////////////////////////////////
function toggle_L1_DetailedAcquisition(en1_dis0)
{  
  var LogItem = new String("8 ") ; 
  var cfg =  en1_dis0 ; 
  var Log_and_cfg = new String (LogItem + cfg );
  L1_diag_cmd( UBM_L1_ISDB_CFG_RDSP_LOG_CMD, Log_and_cfg);
}



////////////////////////////////////////////////////////////////////////////////////////////////
function onClickEnable_Disable_Button(viewName , additionalParam1  , additionalParam2  , additionalParam3 )
{ 

	ItemList = getItemListFromViewName( viewName) ; 
	switch (Enable_Disable_Button_State )
	{
	case 0 : 
			{
				for ( var  i = 0 ; i< ItemList.length ; i++ )
				{	
						
			// CmdList[i] = " 75 44 240 0 116 6 " + ItemList[i] + " 1 0 1" ; 
				var  LogItem = new String("6") ;
				var cfg = 16777472 + ItemList[i]; 
				
				var logItem_and_cfg = new  String ( LogItem + " " + cfg) ; 

				L1_diag_cmd( UBM_L1_ISDB_CFG_RDSP_LOG_CMD, logItem_and_cfg );
	
			   }
	
				Enable_Disable_Button.value = "Disable";
				Enable_Disable_Button.style.backgroundColor = 'red' ; 
				Enable_Disable_Button_State = 1; 
			return ;
			}

	case 1:  
	{
		for ( var  i = 0 ; i< ItemList.length ; i++ )
		{
	           var cfg = 256 + ItemList[i]; 
				var  LogItem = new String("6") ; 
				var logItem_and_cfg = new  String ( LogItem + " " + cfg) ; 

				L1_diag_cmd( UBM_L1_ISDB_CFG_RDSP_LOG_CMD, logItem_and_cfg );
				
			}//close for loop
			
		Enable_Disable_Button.value = "Enable";
		Enable_Disable_Button.style.backgroundColor = 'green' ; 
		Enable_Disable_Button_State = 0; 
		return ; 
		}
	}// close switch
}// close function 
/////////////////////////////////////////////////////////////////////////////////////////
function getItemListFromViewName( viewName) 
{			
			switch (viewName) // takes the relevant items to enable form the view name
			{
			case "DC" :
					return  new Array (1 , 15 , 16 ,17, 18 ) ; 
			break ; 

			case "Rssi_GS_JDmode_ADCutil" : 
					return new Array (1,5,20 ) ; 
			break ; 
			
			case "DvgGain_DvgaOut" : 
					return new Array (1,12,13 ) ; 
    		break ; 
    		case "CONSTELLATION" : 
					return new Array (21,22 ) ; 
    		break ; 
    	
    		case "ZFCE" : 
					return new Array (1, 2 ) ; 
    		break ; 
    	
		}// close switch case 
}// close function 
/// ISDBT 
function L1_diag_cmd( cmd_id, params )
{
 
   var cmd_str = cmd_id + " " + params;

   //DebugMessageDebug( cmd_str );

   SendRequest( DTV_L1_CMD, cmd_str );
}
//////////////////////////////////////////
/// CMMB :
function cmmb_diag_cmd( cmd_id, params )
{
 // debugger; 
   params = ByteFlipU16(params);
   var cmd_str = ctrlRecord + " "+ cmd_id + " " + params;
   SendRequest( DTV_CMMB_CMD, cmd_str );
}

function cmmb_diag_cfg( cmd_id, paramName  , paramValue)
{ 
   var cmd_str = cfgRecord + " " + cmd_id + " " + paramName + " " + paramValue ;
   SendRequest( DTV_CMMB_CMD, cmd_str );
}

//////////////////////////////////////////
function SendRequest( Request, ReqString )
{
    ServerState = IQXDM2.GetServerState();

   if( ServerState == SVR_STATE_CONNECTED )
   {
      var ReqID = IQXDM2.RequestItem( Request,
                                      ReqString,
                                      true,
                                      TIMEOUT_MS,
                                      1,
                                      1 );

      if( ReqID == 0 )
      {
         alert("Error: the request sent form GUI to L1 coulden't be schedueld");
        debugger; 
        // DebugMessageCmd( Txt = "Error scheduling " + Request + " " + ReqString );
         return;
      }
      else
      {
         //DebugMessageCmd(  Request + " scheduled" );
      }
   }
   else
   {
      //DebugMessageCmd( "Error scheduling " + Request + " - Invalid State" );
   }
}
////////////////////////////////////////////////////////////
function CommonSubSysResponseHandler(Item)  
{
	if (AcqStruct.ContainAcqData == undefined)
	{
		var Fields = Item.GetItemFields();
		if (Fields == null) {return ;   }

		if( (Item.GetItemName() == "DTV/L1 Command Response" )  &&    (Fields.GetFieldValue( 1 ) ==UBM_L1_ISDB_GET_CURRENT_STATE_CMD ) ) 
		{
			curr_state_num = Fields.GetFieldValue( 2 );
		}

		if (curr_state_num >= TRAFFIC_STATE  &&    (Fields.GetFieldValue( 1 ) ==UBM_L1_ISDB_GET_CURRENT_STATE_CMD ) )
		{
			ask_For_L1_AcqStatus() ; 
		}

	}   
}
////////////////////////////////////////////////////////////

function getRawDataFromVersionResponse(Item)
{
	var Fields = Item.GetItemFields();
	if (Fields == null) {return ;   }

	selectedTechnology = Fields.GetFieldValue( 2 )  == 1 ? "ISDB-T" : "DVB-H" ;  
	
	RawDataContainer.sw_build        = Fields.GetFieldValue( 4 ) ; 
	RawDataContainer.sw_release      = Fields.GetFieldValue( 5 ) ;
	RawDataContainer.sw_ver          = Fields.GetFieldValue( 6 ) ; 

	RawDataContainer.fw_ver        = Fields.GetFieldValue( 7 ) ; 
	RawDataContainer.fw_sub_version    = Fields.GetFieldValue( 8 ) ; 
}
/////////////////////////////
function  String2Num(val )
{
//return	(val<<0)+(val%1)
 return val*1; 
}
function calcVariance(array , mean , data_len) 
{
var Ex2 ; 
var E2x ;
var array2 = new Array(data_len)
 E2x = Math.pow( mean ,2 ) ;
 
 for ( var i =0 ; i< data_len  ; i++ ) 
 {
  array2[i] = array[i]*array[i] ; 
 }  

 Ex2 =  calcMean(array2 , data_len)  ;

return Ex2 -E2x ; 
}
////////////////////////////////////////////////////////////////
function calcMean(array , data_len)
{
	var sum = 0 ; 
	for ( var i =0 ; i< data_len ; i++ )   
	{
		sum+= array[i] ; 
	}
	return  sum / data_len ; 
}
////////////////////////////////////////////////////////////////
function ConvertSpurFreq (Ubm_Spur_Freq)
{

var BW= 5 ; /// TODO for DVBH
var Fchipx1 = ( selectedTechnology == "ISDB-T" ? (1e06)*64/63 :  (8e06) *BW/7 );  

return ((Ubm_Spur_Freq/Math.pow(2,16)  - 2048 )/4096 )*Fchipx1 ; 

}

function   EnablePeriodicRTC() 
{
	var  LogItem = new String("6") ;
	var cfg = 16777472 + 1 ; //1== ItemList[i]; 
	var logItem_and_cfg = new  String ( LogItem + " " + cfg) ; 
	L1_diag_cmd( UBM_L1_ISDB_CFG_RDSP_LOG_CMD, logItem_and_cfg );
}


////////////////////////////////////////////////
function initGraphRSSIGSAdcLevel() 
   {
   
   /////////////////////////////////////
   ////////set up RSSI graph
   /////////////////////////////////
   RSSI_Graph.RemoveAllChannels();
   RSSI_Graph.RemoveAllAnnotations();
   // Setup channel 
   RSSI_Graph.AddChannel();  
   RSSI_Graph.Labels(0).Caption = "RSSI"
   RSSI_Graph.Channel(0).TitleText = "RSSI";   
   RSSI_Graph.Channel(0).RingBufferSize = 1000;
   RSSI_Graph.Channel(0).MarkersVisible = false;
   RSSI_Graph.Channel(0).color = BLUE;
   RSSI_Graph.Channel(0).TraceLineStyle =  DOTS ; 
   RSSI_Graph.Channel(0).TraceVisible = true;

  // Setup X-axis
   RSSI_Graph.XAxis(0).Title = "OFDM symbol number";
   RSSI_Graph.XAxis(0).TitleShow = true;
 
 
   RSSI_Graph.Xaxis(0).LabelsFormatStyle = 0; 
   RSSI_Graph.Xaxis(0).Span = 512;
	RSSI_Graph.Xaxis(0).Min = -16 ; 
   // Setup Y-axis
   RSSI_Graph.YAxis(0).Title = "RSSI [dBm]";
   RSSI_Graph.YAxis(0).TitleShow = true;
   //RSSI_Graph.Yaxis(0).TrackingStyle = iptsExpandCollapse; 
   
   RSSI_Graph.Yaxis(0).Min = -90;
   RSSI_Graph.Yaxis(0).Span = 90 ;
  
   // Hide toolbar
   RSSI_Graph.ToolBar(0).Visible = false; 
   RSSI_Graph.Legend(0).ShowColumnYValue = true; 
   ////////////////////////////////////////////////////////////////////////////////////////////
  
   /////////////////////////////////////
   ////////set up gain state and RF jammer detection  graph
   /////////////////////////////////

   gainState_JdMode_Graph.RemoveAllChannels();
   gainState_JdMode_Graph.RemoveAllAnnotations();
   // Setup channel 
   gainState_JdMode_Graph.AddChannel();   
   gainState_JdMode_Graph.Labels(0).Caption = "Gain state and Jammer detection mode"  ;    
   gainState_JdMode_Graph.Channel(0).TitleText = "Gain state";
   gainState_JdMode_Graph.Channel(0).RingBufferSize = 1000;
   gainState_JdMode_Graph.Channel(0).MarkersVisible = true;
   gainState_JdMode_Graph.Channel(0).color = BLUE; 
   gainState_JdMode_Graph.Channel(0).TraceLineStyle =  DOTS ; 
   gainState_JdMode_Graph.AddChannel();   
   
   gainState_JdMode_Graph.Channel(1).TitleText = "JdMode";
   gainState_JdMode_Graph.Channel(1).RingBufferSize = 1000;
   gainState_JdMode_Graph.Channel(1).MarkersVisible = true;
   gainState_JdMode_Graph.Channel(1).color = RED ; 
   gainState_JdMode_Graph.Channel(1).TraceLineStyle = DOTS ; 

    // Setup X-axis
   gainState_JdMode_Graph.XAxis(0).Title = "OFDM symbol number";
   gainState_JdMode_Graph.XAxis(0).TitleShow = true;
   gainState_JdMode_Graph.Xaxis(0).LabelsFormatStyle = 0;
   gainState_JdMode_Graph.Xaxis(0).Span = 512;
	gainState_JdMode_Graph.Xaxis(0).Min = -16 ;
   
   // Setup Y-axis
   gainState_JdMode_Graph.YAxis(0).Title = "GainState";
   gainState_JdMode_Graph.YAxis(0).TitleShow = true;
   gainState_JdMode_Graph.Yaxis(0).Min = 0;
   gainState_JdMode_Graph.Yaxis(0).Span = 6;
   gainState_JdMode_Graph.Legend(0).ShowColumnYValue = true; 

   // Hide toolbar
   gainState_JdMode_Graph.ToolBar(0).Visible = false; 
  

    /////////////////////////////////////
   ////////set up ADC Utilization
   /////////////////////////////////

   // Setup channel 
   ADC_Utilization_Graph.RemoveAllChannels();
   ADC_Utilization_Graph.RemoveAllAnnotations();
   ADC_Utilization_Graph.AddChannel();   
   ADC_Utilization_Graph.Labels(0).Caption = "ADC Level"      
  
   ADC_Utilization_Graph.Channel(0).TitleText = "GainDecrThdB";   
   ADC_Utilization_Graph.Channel(0).RingBufferSize = 1000;
   ADC_Utilization_Graph.Channel(0).MarkersVisible = true;
   ADC_Utilization_Graph.Channel(0).color = GREEN ; 
    ADC_Utilization_Graph.Channel(0).TraceLineStyle = SOLID; 
     ADC_Utilization_Graph.Channel(0).TraceVisible = true;
    
    // Setup channel 
   ADC_Utilization_Graph.AddChannel();   
  
   ADC_Utilization_Graph.Channel(1).TitleText = "dBAdcFullScale";   
   ADC_Utilization_Graph.Channel(1).RingBufferSize = 1000;
   ADC_Utilization_Graph.Channel(1).MarkersVisible = false;
   ADC_Utilization_Graph.Channel(1).color = BLUE;
   ADC_Utilization_Graph.Channel(1).TraceLineStyle =SOLID;  
    ADC_Utilization_Graph.Channel(1).TraceVisible = true;  
   
   ADC_Utilization_Graph.AddChannel();   
    
   ADC_Utilization_Graph.Channel(2).TitleText = "GainIncerThdB";   
   ADC_Utilization_Graph.Channel(2).RingBufferSize = 1000;
   ADC_Utilization_Graph.Channel(2).MarkersVisible = true;
   ADC_Utilization_Graph.Channel(2).color = RED;
    ADC_Utilization_Graph.Channel(2).TraceLineStyle = SOLID  ; 

   // Setup X-axis
   ADC_Utilization_Graph.XAxis(0).Title = "OFDM symbol number";
   ADC_Utilization_Graph.XAxis(0).TitleShow = true;
   ADC_Utilization_Graph.Xaxis(0).LabelsFormatStyle = 0 ; 
   ADC_Utilization_Graph.Xaxis(0).Span = 512;
 ADC_Utilization_Graph.Xaxis(0).Min = -16;

   // Setup Y-axis
   ADC_Utilization_Graph.YAxis(0).Title = "dB ADC Full-Scale";
   ADC_Utilization_Graph.YAxis(0).TitleShow = true;
   ADC_Utilization_Graph.Yaxis(0).TrackingStyle = iptsExpandCollapse ;
    
   ADC_Utilization_Graph.Yaxis(0).Min = -100;
  ADC_Utilization_Graph.Yaxis(0).Span = -20;
  
   // Hide toolbar
   ADC_Utilization_Graph.ToolBar(0).Visible = false; 
   ADC_Utilization_Graph.Legend(0).ShowColumnYValue = true; 
   }
   
function  PopulateGraphs_RSSI_GS_AdcLevel(actual_len , curr_GS) 
{

	for (var i = 0 ; i< actual_len ; i++  )
	{ 
		
		if ( periodicGraphData.XaxisData[i] == 0)	{		InitDisplay(); 			}
		
		
		RSSI_Graph.Channel(0).AddXY( periodicGraphData.XaxisData[i], periodicGraphData.status_rssi[i]);  
		
		if (RawDataContainer.ACQ_state != undefined) 
			{
			RSSI_Graph.Channel(RawDataContainer.ACQ_state + 1).AddXY( periodicGraphData.XaxisData[i], periodicGraphData.status_rssi[i]);  
		   
		   }
		
		
		
			gainState_JdMode_Graph.Channel(0).AddXY(periodicGraphData.XaxisData[i] ,periodicGraphData.GainState[i]) ;  
			gainState_JdMode_Graph.Channel(1).AddXY(periodicGraphData.XaxisData[i] ,periodicGraphData.JdMode[i]) ;  
		 
	
			if ( periodicGraphData.GainState[i] != 6 )
			{	
			ADC_Utilization_Graph.Channel(0).AddXY(periodicGraphData.XaxisData[i] , periodicGraphData.curr_GainDecrThDb[i]  ) ; 
				}

			ADC_Utilization_Graph.Channel(1).AddXY(periodicGraphData.XaxisData[i] , RawDataContainer.AdcLevel  ) ; 
			
			if (RawDataContainer.ACQ_state != undefined) 
			{
				 ADC_Utilization_Graph.Channel(RawDataContainer.ACQ_state + 3).AddXY(periodicGraphData.XaxisData[i] , RawDataContainer.AdcLevel ) ; 
			}
		
			if (   periodicGraphData.GainState[i] != 0 )
			{	
		    ADC_Utilization_Graph.Channel(2).AddXY(periodicGraphData.XaxisData[i] , periodicGraphData.curr_GainIncerThDb[i]  ) ; 
	       }
		
		if (ShowGainStateChanges.checked)
		{
			Add_GS_Annotation_to_graph(gainState_JdMode_Graph , curr_GS[i]);
			Add_GS_Annotation_to_graph(RSSI_Graph , curr_GS[i]);
			Add_GS_Annotation_to_graph(ADC_Utilization_Graph , curr_GS[i]);
			
			previos_GS = curr_GS[i] ; 
		}	
			
			
	}// close for loop over the raws
	previos_GS = curr_GS[Math.ceil(actual_len)-1] ; 
}// close function PopulateGraphs

function Add_GS_Annotation_to_graph(graph , curr_GS)
{
	if (first_time) 
	{
		if (ShowGainStateChanges.checked)
		{
		addAnnotation(RawDataContainer.XaxisData[0], graph, AQUA, "Gain State: " + curr_GS);		
		first_time = false ; 
		}
	}


	if (curr_GS != previos_GS)
	{
		if (ShowGainStateChanges.checked)
		{
			addAnnotation(RawDataContainer.XaxisData[0], graph, AQUA, "GS:" + previos_GS + " -----> " + "GS: " + curr_GS);		
		}
		
	}
}// close function


 function CreateChannelsForDetailAcquisition (graph , channel_num) 
  {

   graph.AddChannel();  
    graph.Channel(channel_num).TitleText ="DC Warm Up" ;
   graph.Channel(channel_num).RingBufferSize = 1000;
   graph.Channel(channel_num).MarkersVisible = true;
   graph.Channel(channel_num).color =  PINK ;
   graph.Channel(channel_num).TraceLineStyle = DOTS ; 
	graph.Channel(channel_num).TraceVisible = false ; 
 
 
 channel_num++; 
    graph.AddChannel();  
   graph.Channel(channel_num).TitleText ="AGC Warm Up" ;
   graph.Channel(channel_num).RingBufferSize = 1000;
   graph.Channel(channel_num).MarkersVisible = true;
   graph.Channel(channel_num).color =  BLUE;
   graph.Channel(channel_num).TraceLineStyle = DOTS  ;
   graph.Channel(channel_num).TraceVisible = false ;  
    
 
 channel_num++; 
    graph.AddChannel();  
    graph.Channel(channel_num).TitleText ="JD State" ;
   graph.Channel(channel_num).RingBufferSize = 1000;
   graph.Channel(channel_num).MarkersVisible = true;
   graph.Channel(channel_num).color =  RED ;
   graph.Channel(channel_num).TraceLineStyle = DOTS ; 
   graph.Channel(channel_num).TraceVisible = false ; 
   
    channel_num++;  
    graph.AddChannel();  
   graph.Channel(channel_num).RingBufferSize = 1000;
   graph.Channel(channel_num).MarkersVisible = true;
   graph.Channel(channel_num).color =  WHITE;
   graph.Channel(channel_num).TraceLineStyle = DOTS  ; 
   graph.Channel(channel_num).TraceVisible = false ; 
   graph.Channel(channel_num).TitleText ="rest of Acq" ;
  } 
   
   
   
   /////////////////////////////////////
function DisableButton(Button) 
{
Button.disabled = true ; 
Button.style.backgroundColor = 'gray' ;
}  

/////////////////////////////////////////////////////////////////////////
function EnableButton(button , color)
{
	button.disabled = false;    
	button.style.backgroundColor = color;
 } 
/////////////////////////////////////////////////////////////////////////

function  HideGraph(graph)  
{
   graph.height = "1%" ; 
}

 function getTime_Ms()
   {
 
   var sec = 0  , ms = 0 , t; 
   var d = new Date();
   sec = d.getSeconds()
   ms= d.getMilliseconds()
   t= sec*1000 + ms ; 
   return t ; 
   }
   
   //////////////////////////////////////////////////////////////////
  function HandleCommonPerFrameEvent(Item , additional_param) 
  {
    for (var i =0 ; i< graph_list.length ; i++ )
    {
	 populateEventForGraph(Item,  graph_list[i] , additional_param);
    }
  }
  
  
  function StringHasSubstr(str ,  substr)
{
var patt1 = new RegExp(substr);

return patt1.test(str);

}


function GetItemID(Item)  
{
	var key = Item.GetItemKeyText();
	key = key.substring(1, key.length-1) ;  // removing the [ ] for the [0xA306]
	key = String2Num(key) ; 
	return key ; 

}// close function GetItemID(Item)  


	function UpdateModeRelatedVars()
		{
		FftSizeCx1 = Math.pow(2,7 + RawDataContainer.mode);
		FbinHz = Math.round(Fchipx1Hz/FftSizeCx1);
}// close function 

///////////////////////////////////////////
function  Sleep(n)
{
n *= 100 ; 
while (n--)
 {
var x= n+1 ; 
}


} 
///////////////////////////////////////////
function RegisterToAllCMMBItems()
		{
		 
		ClientObject.AddLog(LOG_DTV_CMMB_CONTROL_TABLE_UPDATE); 
		ClientObject.AddLog(LOG_DTV_CMMB_MEDIA_BUFFERING_STATUS);

		ClientObject.AddLog(LOG_DTV_CMMB_CONTROL_EMERGENCY_BCAST); 
		ClientObject.AddLog(LOG_DTV_CMMB_CAS_EMM_ECM);
		ClientObject.AddLog(LOG_DTV_CMMB_HW_PERFORMANCE);
		ClientObject.AddLog(LOG_DTV_CMMB_ESG_PROGRAM_INDICATION_INFORMATION);
		
		ClientObject.AddEvent( EVENT_DTV_CMMB_API_CALL_ACTIVATE )    ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_CALL_DEACTIVATE                             ) ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_CALL_TUNE                                   )   ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_CALL_SELECT_SERVICE                         )   ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_DESELECT_SERVICE                      )    ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_GET_SIGNAL_PARAMETERS                 )     ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_GET_NIT                               )     ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_GET_CMCT                              )    ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_GET_SMCT                              )     ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_GET_CSCT                              )     ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_GET_SSCT                              )     ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_GET_EADT                              )     ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_REQUEST_CA_CARD_NUMBER                )     ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_REQUEST_CAS_VERSION                   )     ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_REGISTER_FOR_CONTROL_NOTIFICATIONS    )     ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_CALL_DEREGISTER_FROM_CONTROL_NOTIFICATIONS )     ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_ACTIVATE                      )    ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_DEACTIVATE                    )  ;             
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_TUNE                          )  ;
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_SELECT_SERVICE                )      ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_DESELECT_SERVICE              )    ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_NOTIFICATION_TABLE_UPDATE                   )     ;
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_SIGNAL_PARAMETERS             )     ;
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_AUTHORIZATION_FAILURE         ) ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_REGISTER_FOR_CONTROL_NOTIFICATIONS_COMPLETE ); 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_DEREGISTER_FROM_CONTROL_NOTIFICATIONS_COMPLETE ); 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_NOTIFICATION_CA_CARD_NUMBER                  )    ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_NOTIFICATION_CAS_VERSION                      )    ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_EMERGENCY_BROADCASTING_TRIGGER )    ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_NOTIFICATION_EMERGENCY_BROADCASTING_MESSAGE  )   ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_CALL_REGISTER_FOR_ESG_NOTIFICATIONS )  ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_CALL_DEREGISTER_FROM_ESG_NOTIFICATIONS )  ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_CALL_GET_BASIC_DESCRIPTION_INFORMATION )  ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_CALL_SET_OUTPUT_PATH )  ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_API_NOTIFICATION_ESG_DATA_INFORMATION )  ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_ESG_DATA_INFORMATION_DOWNLOAD_COMPLETE )  ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_ESG_PROGRAM_INDICATION_INFORMATION)  ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_REGISTER_FOR_ESG_NOTIFICATIONS_COMPLETE)  ; 
ClientObject.AddEvent(  EVENT_DTV_CMMB_API_NOTIFICATION_DEREGISTER_FROM_ESG_NOTIFICATIONS_COMPLETE)  ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_CAS_INITIALIZED  )     ; //
ClientObject.AddEvent(  EVENT_DTV_CMMB_CAS_EMM_RECEIVED_AND_PROCESSED )     ; 
ClientObject.AddEvent( EVENT_DTV_CMMB_CAS_ECM_RECEIVED_AND_PROCESSED  )     ; 
	
		 ClientObject.AddSubsysResponse( 44, 13 );
		
   
   }
   
   
   
   function ByteFlipU16(x)
   {
   if (x=="") {return "";   }
   
   var msb = x >> 8 ; 
   var lsb = x & 0xFF ; 
   var res = (lsb << 8)  + msb ; 
   return res ; 
   }
   
   
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
   
function getRawDataFromChordStatusLog(Item)
{
	
	var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	ItemTs = Item.GetItemSpecificTimestamp2()
	idx= 1; 

	var reg0x80 = Fields.GetFieldValue( idx++  );
	RawDataContainer.LNA_state  =  reg0x80& 0x7 ; 
	NBJDET_Mask                 = reg0x80& 0x8 ; 
	WBJDET_Mask                 = reg0x80& 0x10 ; 
	ChOrdStatus.mixer_type      = (reg0x80& 0x40 )  ? "HRM"  : "SRM" ; 
	power_ctrl                  = reg0x80& 0x80  ; 

	protection_info.concurrent_tx_active             = Fields.GetFieldValue( idx++  ) == false ? "NOT ACTIVE" : "ACTIVE";
	ChOrdStatus.protection_active     = Fields.GetFieldValue( idx++  )== false ? "NOT ACTIVE" : "ACTIVE";
	
	protection_info.tx_freq_defined  = Fields.GetFieldValue( idx++  ); 
	protection_info.tx_pow_defined   = Fields.GetFieldValue( idx++  ); 
	protection_info.rssi_defined     = Fields.GetFieldValue( idx++  ); 

	if (protection_info.tx_freq_defined  ) {
		protection_info.tx_freq_MHz    =  Fields.GetFieldValue( idx++  ) /1e3 ; 
	}else{
		idx++;
		protection_info.tx_freq_MHz    = "NA" ; 
	}
	
	if (protection_info.tx_pow_defined) {
		protection_info.tx_pwr_dbm =  Fields.GetFieldValue( idx++  )/100; 
	}else{
		idx++;
		protection_info.tx_pwr_dbm = "NA" ; 
	}
	
	if (protection_info.rssi_defined) {
		protection_info.rssi_100ths_dbm =  Fields.GetFieldValue( idx++  )/100; 
	}else{
		idx++;
		protection_info.rssi_100ths_dbm = "NA" ; 
	}
	
	
	
	protection_action.goto_jd_mode2     = Fields.GetFieldValue( idx++  );
	protection_action.enable_hrm             = Fields.GetFieldValue( idx++  );
	
}// close function Chord Log 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getRawDataFromChordTXactivityLog(Item)
{


	var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	ItemTs = Item.GetItemSpecificTimestamp2()
	idx= 0; 

	var ver = Fields.GetFieldValue( idx++  );
	
	concurent_tx_info.tx_about_to_start = Fields.GetFieldValue( idx++  )? "ACTIVE" : "NOT ACTIVE";
	concurent_tx_info.tech_mask = getTechMask ( Fields.GetFieldValue( idx++  ) );
	concurent_tx_info.band_mask = Fields.GetFieldValue( idx++  );
	concurent_tx_info.start_time_provided = Fields.GetFieldValue( idx++  );
	
	if (concurent_tx_info.start_time_provided) {
		concurent_tx_info.start_time_ms = Fields.GetFieldValue( idx++  );
	}else{
		idx++;
		concurent_tx_info.start_time_ms = "NA" ; 
	}
	
	concurent_tx_info.duration_provided = Fields.GetFieldValue( idx++  );
	if (concurent_tx_info.duration_provided) {
	concurent_tx_info.duration_ms = Fields.GetFieldValue( idx++  );
	}else{
		idx++;
		concurent_tx_info.duration_ms = "NA" ; 
	}
	
	
	 concurent_tx_info.tx_pow_defined= Fields.GetFieldValue( idx++  );
	
	if (concurent_tx_info.tx_pow_defined) {
		concurent_tx_info.tx_pwr_dbm = Fields.GetFieldValue( idx++  )/100;
	}else{
		idx++;
		concurent_tx_info.tx_pwr_dbm = "NA" ; 
	}
	
	
	concurent_tx_info.tx_freq_defined = Fields.GetFieldValue( idx++  );
	
	if (concurent_tx_info.tx_freq_defined) {
		concurent_tx_info.tx_freq_MHz = Fields.GetFieldValue( idx++  )/1e3;
	}else{
		idx++;
		concurent_tx_info.tx_freq_MHz = "NA" ; 
	}
	
	concurent_tx_info.tech_spec_data_provided = Fields.GetFieldValue( idx++  );
	
	if (concurent_tx_info.tech_spec_data_provided) 
	{
		concurent_tx_info.num_hopping_freq = Math.min ( Fields.GetFieldValue( idx++  ),64 )   ;
		concurent_tx_info.hopping_freq_array= new Array(concurent_tx_info.num_hopping_freq);
		concurent_tx_info.hopping_freq_array[1] = 	concurent_tx_info.hopping_freq_array[2] =0 ; 
		var j= 0 ; 
		for (var i = 0 ; i < concurent_tx_info.num_hopping_freq ; i++)
		{
			var f= Fields.GetFieldValue( idx++  );
			if (f != 0) {
				concurent_tx_info.hopping_freq_array[j++] = (f/1e3).toFixed(1) ; 
			}
			
		}// close for loop
	
	}else{
		concurent_tx_info.num_hopping_freq = 0 ; 
		concurent_tx_info.hopping_freq_array= new Array() ; 
	}
	
	
}


  ////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
function str2num(str)
{
return str*=1 ; 
}


function beep(soundObj)
{
soundObj.Play(); 
} 

function Register_QTV_AV_Quality_Items()
{
	//ClientObject.AddLog(LOG_QTV_Frame_Decode_Information); 
	ClientObject.AddLog(LOG_QTV_Frame_Render_Information);
	ClientObject.AddLog(LOG_QTV_Audio_Video_Sync);
	
	ClientObject.AddEvent(EVENT_QTV_CLIP_ENDED);
	ClientObject.AddEvent(EVENT_QTV_CLIP_STARTED);
	
}

function getRawDataFromQTV_Frame_render_info( Item  ) 
{

cnt_fps++ ; 
}
/*
	curr_render_ts                 = Item.GetItemSpecificTimestamp2();

	QTV_curr_DeltaT_between_Frames =  (curr_render_ts - prev_render_ts)*1e5 / 1.15 ; //this factor is needed.. i dont know why roeec ?  
	prev_render_ts            =  curr_render_ts ;   // keep it for the next iteration

	if(qtv_fps_first_time) // in the first time there is no diff , so avoid corrptint the sum
	{
		qtv_fps_first_time = false ; 
		return ; 
	}


	sum  = sum - QTV_DeltaT_array[cyc_idx] + QTV_curr_DeltaT_between_Frames ; 

	QTV_DeltaT_between_Frames = sum/qtv_fps_buf_len ; 


	QTV_DeltaT_array[cyc_idx] = QTV_curr_DeltaT_between_Frames ; 
	cyc_idx = (cyc_idx +1 ) % qtv_fps_buf_len ;

} 
*/
////////////////////////////////////////////////////////////////////////////////
function getRawDataFromQTV_Frame_decode_info( Item  ) 
{
    var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	
	prev_QTV_Frame_type = QTV_Frame_type ; 
	QTV_Frame_type = Fields.GetFieldValueText( 0 ) ;

} 
////////////////////////////////////////////////////////////////////////////////
function getRawDataFromQTV_AV_Sync( Item  ) 
{
	var Fields               = Item.GetItemFields();
	if (Fields == null) {return ;   }
	
	QTV_lag_lead_AV_Sync = Fields.GetFieldValue( 1 );
}
////////////////////////////////////////////////////////////////////////////////
function PopulateQTV_fps(obj)
{
FPS_TH_PERCENT = 10 ; 

var fps = 1/QTV_DeltaT_between_Frames ; 
	
	
if (fps  < str2num(QTV_fps_th.value)) 
	{
		beep(sound1);
		obj.style.backgroundColor = 'red';
	}else{
		obj.style.backgroundColor = 'white';
	}
	
	obj.value =fps.toFixed(0) ; 
	
} // close function 
/////////////////////////////////////////////////////////////////////////
function PopulateQTV_AV_Sync(obj)
{
	
	if (QTV_lag_lead_AV_Sync > 100 || QTV_lag_lead_AV_Sync < -100  ) 
	{
		//beep(sound1);
		obj.style.backgroundColor = 'red';
	}else{
		obj.style.backgroundColor = 'white';
	}
	obj.innerText = QTV_lag_lead_AV_Sync ; 
	
	
} // close function 
/////////////////////////////////////////////////////////////////////////

function  getTechMask(val)
{

switch(val)
{
	case 0x00000001 : 
		return "CDMA" ; 
	case 0x00000002 : 
		return "EVDO" ; 
	case 0x00000004 : 
		return "GSM" ; 
	case 0x00000008 : 
		return "GPRS" ; 
	case 0x00000010 : 
		return "EDGE" ; 
	case 0x00000020 : 
		return "UMTS" ; 
	case 0x00000040 : 
		return "HSPA" ; 
	case 0x00000080 : 
		return "WLAN" ; 
	case 0x00000100 : 
		return "BT" ; 
	case 0x00000200 : 
		return "LTE" ; 
	case 0xFFFFFFFF : 
		return "ALL TECH" ; 
	case 0 : 
		return "NA" ; 


}// close switch


}//close function 
/////////////////////////////////////////////////////////////
function AddToList(list_name ,element_name ) 
{
	if ( ! isExist(list_name, element_name))
	{
		list_name.push( element_name) ; 
	}
}
/////////////////////////////////////////////////////////////
function isExist(list_name, element_name)
{
	for (var k = 0 ; k < list_name.length ; k++ )
	{
		if (list_name[k] == element_name ) {
		return true; 
		}
	}
return false; 
}
/////////////////////////////////////////////////////////////

 function RemoveFromList(list_name ,element_name ) 
 { 
      // debugger;
         var idx = 0 ;
         for ( k = 0  ; k< list_name.length ; k++ )
         {
            if (list_name[k] == element_name)
            {
             idx= k ;
             break ;  
            }
            
         }
        
        list_name.splice (idx,1) ; 
 }
/////////////////////////////////////////////////////////
 function getAllListValues(list_name)
{
var ret = "" ;
	for (m = 0 ; m< list_name.length ; m++)
	{
		ret = ret + list_name[m]+ ", " ; 
	}
return ret; 
}
 
 
 function isEmpty(list_name)
 {
 return !list_name.length ; 
 }
 
 function L1_reset_counters()
{
  L1_diag_cmd( UBM_L1_RESET_COUNTERS_CMD, "" );

  L1_diag_cmd( UBM_L1_ISDB_RESET_PKT_TRASH_COUNTERS_CMD, "" );
}


function init_qtv_fps_array()
{
for (var k = 0 ; k < qtv_fps_buf_len ; k++){
	QTV_DeltaT_array[k] = dt_frames ;
}
sum = qtv_fps_buf_len * dt_frames ; 
}


function  ProcessDIAG( Item )
{ 
 var Fields = Item.GetItemFields();
 if (Fields == null) {return ;   }

	if(GetItemID(Item) == BUILD_ID_ITEM_ID)
	{
		CRM_Build =  Fields.GetFieldValue( 3); 
        RefreshGUI() ;   
	}
}// close function ProcessDIAG




function Process_EVENT_QTV_CLIP_ENDED()
{ 
 clearInterval( check_FPS_interval_ID );
}
/////////////////////////////////////////////////////////////////
function Process_EVENT_QTV_CLIP_STARTED()
{
 EVENT_QTV_CLIP_STARTED_received = true; 
 check_FPS_interval_ID = setInterval ( "CheckFrameRenderRate()", 2000 );
}
/////////////////////////////////////////////////////////////////