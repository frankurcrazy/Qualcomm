var status_cnt = 0 ; 
var chord_cnt = 0 ; 
var user_request_record_tsif = false ; 
////////////////
// CONSTANTS //
///////////////
var SCANED_FREQS = 1 ; 
var BY_REGION_FREQS = 0 ; 
var FreqSetupType = 0;
var OneBitThreshold = 1473 ; 
var PHY_TEST_TYPE = 0 ;
var VIDEO_TEST_TYPE = 1 ; 
var SCAN_TEST_TYPE = 2 ; 
var oneBitResponseCount = 0;
var Gui_perform_acquisition = false ;
var Region = 0;
var ChannelNum = 0 ;
var REGION_BRAZIL = 1;
var REGION_JAPAN = 0;
var REGION_BRAZIL_StartChan = 14; 

var REGION_BRAZIL_EndChan   = 69;
var REGION_JAPAN_StartChan  = 13;
var REGION_JAPAN_EndChan    = 62;
var testZeroPayloadIsRunning = false ; 
var isdb_url_file = "/mod/mediaplayer/media/557142857.url";

var url_contents = "isdb://-frequency=557142857";
var isdb_scan_file = "/mod/mediaplayer/media/scan.url";
var scan_contents = "isdb://scan";

var avs_cnt = 0 ; 
////////////////
// GLOBALS //
///////////////
var userType = "Advanced" ; 
var start_chan   ;
var end_chan	 ;
var gRequestIDs  = new Array;
var log_items        = new Array();
var event_handlers   = new Array();
var subsys_responses = new Array();
var qtv_api_response_handlers = new Array();
var lastItemProcessed = -1;                   
var  phy_test_is_running = false ; 
var  gui_did_powerup = false ; 
var  video_test_is_running = false ; 
var IsReceivedFWversion = false ; 
var IsReceivedHWVersion = false ; 
var checkingQTV_CFG_File = false ;
var efs2_filename;
var efs2_file_contents;
var efs2_complete_function;
var efs2_complete_function_args;
var efs2_fd;

var test_record_in_active = false ;  


/* Frequency and Test status */



var CurrentStopTestFunction;

var TestType = PHY_TEST_TYPE;
var OldTestType;
/* QTV Variables */
var qtv_sequence_number = 1;
var qtv_handle = 0;


/* L3 Variables */
var error_bit_set_reset_value;
var ts_packets;
       
var bad_pes_packets_reset_value;
var pes_packets_reset_value;

var bad_sections_reset_value;
var crc_errors_reset_value;
var sections_reset_value;

var video_overflows_reset_value;
var audio_overflows_reset_value;
var subtitles_overflows_reset_value;

var video_underflows_reset_value;
var audio_underflows_reset_value;
var subtitles_underflows_reset_value;

var discard_video_oflow_reset_value;
var discard_audio_oflow_reset_value;
var discard_subtitles_oflow_reset_value;

var tps_reset_flag = true;
var pes_reset_flag = true;
var sections_reset_flag = true;
var buffering_reset_flag = true;

/* EFS variables */
var EFS2_fd;

//var isdb_url_file = "/mod/mediaplayer/media/isdb.url";


var EFS2_active = false;

var signal_ok = false;

var ValidFrequencies = new Array();
var ValidChannelNum = new Array();


// Set this to true to debug the Appplication
var debug = false;

// Set this true to automatically open a filtered view on all events required by app.
var show_filtered_view = true;

var QTV_cb_registered = false;

function ProcessUBMSubsystemResponse(Item)
{

	var Fields = Item.GetItemFields();
	if (Fields == null) {return ;   }
	switch(Fields.GetFieldValue( 1 )) 
	{
	case UBM_L1_ISDB_GET_CURRENT_STATE_CMD:
		{
			ProcessStateResponse(Item) ; 
			break;
		}
	case UBM_L1_ISDB_GET_VERSION_INFO_CMD:
		{
			ProcessVersionsResponse(Item)
			break;
	   }	
		
	}// close switch

} // close function 

///////////////////////////////////////////////////////////////////////////////

function onclickPowerUpButton()
{

	DisableButton(gui_front.PowerUpButton);
	L1_powerup() ; 

	
}
///////////////////////////////
function onclickPowerDownButton()
{
	DisableButton(gui_front.PowerDownButton); 	
	L1_powerdown();
	
}

/////////////////////////////////////

function onclickAcquireButton()
{
	Gui_perform_acquisition = true; 
	DisableButton(gui_front.AcquireButton) ;  
	L1_acquire();
	 
	
}
	
/////////////////////////////////////////////////////////////////////////


function onclickStopDSPButton()
{
		DisableButton( gui_front.StopDSPButton);
		L1_StopDSP() ; 
		

}// close function StopDSP()

 /////////////////////////////////////////////////////////////////////////  


 /////////////////////////////////////////////////////////////////////////  
function l1_sub_packet_id_func ( SubPacketID, process_function )
{
  this.subpacket_id = SubPacketID;
  this.process_function = process_function;
}
/////////////////////////////////////////////////////////////////////////
function log_event_item( ID, name, process_function )
{
  this.ID = ID;
  this.name = name;
  this.process_function = process_function
}
/////////////////////////////////////////////////////////////////////////
function subsys_response_item( DispatchID, DispatchCode, name, process_function )
{
  this.DispatchID       = DispatchID;
  this.DispatchCode     = DispatchCode;
  this.name             = name;
  this.process_function = process_function;
}
/////////////////////////////////////////////////////////////////////////
function directory_entry( Type, Mode, Size, ATime, MTime, CTime, Name )
{
  this.Type  = Type;
  this.Mode  = Mode;
  this.Size  = Size; 
  this.ATime = ATime; 
  this.MTime = Mtime; 
  this.CTime = CTime; 
  this.Name  = Name;
}
/////////////////////////////////////////////////////////////////////////
function qtv_api_cmd_item( api_cmd, process_function )
{
  this.api_cmd          = api_cmd;
  this.process_function = process_function;
}


 
////////////////////////////////////////////////////////////////
function RegisterSpecificViewItems()
{
	InitGuiSpecificView();
	SelectRegion(REGION_JAPAN)
	SelectFreqSetupType(BY_REGION_FREQS);

	DisableButton(gui_front.ScanButton) ; 
	gui_front.ChannelSelectRegion[Region].checked = true;
	gui_front.FreqSetupTypeControl[FreqSetupType].checked = true;


   RegisterLogHandlers();
 
 ClientObject.ClearConfig();
 IQXDM2.ClearClientItems(Handle) ;

 // debugger; 
   // Strings - for connected status
  
     for( var i=0; i< 5 ; i++ )
   {
     ClientObject.AddString( i );
   }
   
   // Events
   for( var i=0; i< event_handlers.length; i++ )
   {
     ClientObject.AddEvent( event_handlers[i].ID );
   }

   // Register Logs
   for( var i=0; i < log_items.length; i++ )
   {

     if ( StringHasSubstr(log_items[i].name ,  "QTV" ) && !gui_front.qtv_logs_en.checked )  { continue ;    }
     if ( StringHasSubstr(log_items[i].name ,  "ChOrd" ) && !gui_front.chord_logs_en.checked ) { continue ;    }
     
     
     ClientObject.AddLog( log_items[i].ID );
   }
    
   // Register Subsystem Responses
   for( var i=0; i < subsys_responses.length; i++ )
   {
     ClientObject.AddSubsysResponse( subsys_responses[i].DispatchID, subsys_responses[i].DispatchCode );
   }

   ClientObject.AddMessage(31 , 9 ); // DTV/TSP/IF  for the record TSIF command
   ClientObject.AddMessage(31 , 3 ); 
   
   ClientObject.AddDiagResponse( BUILD_ID_ITEM_ID ); // sw version 
  


   // Commit the configuration
   ClientObject.CommitConfig();
    
    SendRequest( BUILD_ID_REQ, "" );
	ask_For_L1_state() ;
    ask_For_L1_Versions();
   desired_fps = ISDBT_BRAZIL_FPS ; 

}// close function 


//////////////////////////////////////////////////////////////////////////
function InitDisplay()    
{
	if ( firstOnloadHappend ) 
    {
	  return  ; 
    }else{
	  firstOnloadHappend = true; 
    }
	
	ResetVersionTable();
	ResetPhyParamsTable();
	ResetTrackingParamsTable();
	ResetAcquisitionTable();
	SelectFreqSetupType( FreqSetupType );


	UpdateStateMachineDisplay();
  // GetConnectedState();
   RefreshGUI() ; 
}
/////////////////////////////////////////////////////////////////////////
function isTestVideo()
{
  return( TestType == VIDEO_TEST_TYPE );
}
/////////////////////////////////////////////////////////////////////////
function isTestPhy( )
{
  return( TestType == PHY_TEST_TYPE );
}
/////////////////////////////////////////////////////////////////////////
function isTestScan( )
{
  return( TestType == SCAN_TEST_TYPE );
}
/////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////
 function UnRegisterSpecificPerView() 
 {

  //QTV_Framework_Stop();
  /*StopTest();
 // Remove all outstanding periodic requests
  for( var s = 0; s < gRequestIDs.length; ++s )
  {
    IQXDM2.RemoveRequest( gRequestIDs[s] );
  }
  */
 }
 //////////////////////////////////////////////////////// clear

function RegisterLogHandlers( )
{

  log_items[0] = new log_event_item( UBM_L1_LOG_STATUS_C          ,"DVB-H UBM L1 Status Information",     ProcessL1LogItem );
  log_items[1] = new log_event_item( 0x13E4                       ,"DTV ISDB-T Transport Stream Packets", ProcessTSPLog );
  log_items[2] = new log_event_item( 0x13E5                       ,"DTV ISDB-T PES Packets",              ProcessPESLog );
  log_items[3] = new log_event_item( 0x13E6                       ,"DTV ISDB-T Sections",                 ProcessSectionsLog );
  log_items[4] = new log_event_item( UBM_DTV_ISDBT_BUFFERING     , "DTV ISDB-T Buffering",                 ProcessBufferingLog );
  log_items[5] = new log_event_item( UBM_L1_LOG_ACQ_C              ,"DVB-H UBM L1 Acquisition Information", ProcessAcquisitionLog );
  log_items[6] = new log_event_item( UBM_L1_LOG_CHORD_STATUS       ,"ChOrd Status V1"               , ProcessChordStatusLog );
  log_items[7] = new log_event_item( UBM_L1_LOG_CHORD_TX_ACTIVITY  ,"ChOrd Tx Activity V1"     , ProcessChordTXactivityLog );
  log_items[8] = new log_event_item( LOG_QTV_Frame_Render_Information ,"LOG_QTV_Frame_Render_Information" , processQTV_Render_Log );
  log_items[9] = new log_event_item( LOG_QTV_Audio_Video_Sync  ,"LOG_QTV_Audio_Video_Sync"  , processQTV_AV_Sync_Log );



  event_handlers[0] = new log_event_item( EVENT_POWERUP         , "EVENT_DTV_L1_POWERUP",             ProcessPowerupDone );
  event_handlers[1] = new log_event_item( EVENT_POWERDOWN       , "EVENT_DTV_L1_POWERDOWN",           ProcessPowerdownDone );
  event_handlers[2] = new log_event_item( EVENT_ACQ_DONE_STATUS , "EVENT_DTV_L1_ACQ_DONE_STATUS",     ProcessAcqDoneStatusEvent );
  event_handlers[3] = new log_event_item( 1270                  , "EVENT_DTV_TABLE_ACQ_SUCCESS" ,     ProcessDtvTableAcqEvent );
  event_handlers[4] = new log_event_item( 1317                  , "EVENT_DTV_DVBH_DEINIT_SUCCESS" ,    null );
  event_handlers[5] = new log_event_item( EVENT_STATE_CHANGE    , "EVENT_DTV_L1_STATE_CHANGE" ,       ProcessL1StateChangeEvent );
  //event_handlers[6] = new log_event_item( EVENT_DTV_L1_L3_API_COMMAND  , "EVENT_DTV_L1_L3_API_COMMAND" ,       ProcessL1L3API_cmdEvent );
 event_handlers[6] = new log_event_item( EVENT_QTV_FIRST_VIDEO_I_FRAME_RENDERED     , "Process_QTV_event" ,       Process_QTV_event_i_frame_rendered );

  event_handlers[7] = new log_event_item( EVENT_MBP_RF_ANALOG_JD_MODE_CHANGE    , "EVENT_MBP_RF_ANALOG_JD_MODE_CHANGE" , getRawDataFrom_JD_MODE_CHANGE );
  event_handlers[8] = new log_event_item( EVENT_QTV_CLIP_STARTED             , "EVENT_QTV_CLIP_STARTED" ,       Process_EVENT_QTV_CLIP_STARTED );
  event_handlers[9] = new log_event_item( EVENT_DTV_ISDB_ACTIVATE             , "Process_L3_event" ,        Process_L3_event_activate );
event_handlers[10] = new log_event_item( EVENT_DTV_ISDB_DEACTIVATE             , "Process_L3_event" ,       Process_L3_event_de_activate );
event_handlers[11] = new log_event_item( EVENT_DTV_ISDB_TUNE             , "Process_L3_event" ,       Process_L3_event_tune );
event_handlers[12] = new log_event_item( EVENT_DTV_ISDB_UNTUNE             , "Process_L3_event" ,       Process_L3_event_un_tune );
event_handlers[13] = new log_event_item( EVENT_DTV_ISDB_SELECT_SERVICE   , "Process_L3_event" ,   Process_L3_event_select_service );
event_handlers[14] = new log_event_item( EVENT_DTV_ISDB_SERVICE_AVAILABLE , "Process_L3_event" ,       Process_L3_event_service_available );
event_handlers[15] = new log_event_item( EVENT_DTV_ISDB_TRAFFIC_LOST, "Process_L3_event" ,       Process_L3_event_traffic_lost );
event_handlers[16] = new log_event_item( EVENT_DTV_ISDB_TABLE_UPDATE, "Process_L3_event" ,       Process_L3_event_table_update );
event_handlers[17] = new log_event_item( EVENT_DTV_ISDB_TRACKS_SELECTED ,  "Process_L3_event" ,       Process_L3_event_track_selected );
event_handlers[18] = new log_event_item( EVENT_DTV_ISDB_PES_BUFFER_OVERFLOW , "Process_L3_event" ,       Process_L3_event_pes_overflow );
event_handlers[19] = new log_event_item( EVENT_DTV_ISDB_PES_BUFFER_UNDERFLOW, "Process_L3_event" ,      Process_L3_event_pes_underflow );
event_handlers[20] = new log_event_item( EVENT_DTV_ISDB_ACQUIRE_DATA_COMPONENT, "Process_L3_event" ,       Process_L3_event_acq_data_comp );
event_handlers[21] = new log_event_item( EVENT_DTV_ISDB_STOP_COMPONENT_ACQUISITION , "Process_L3_event" ,       Process_L3_event_stop_comp_acq );
event_handlers[22] = new log_event_item( EVENT_DTV_ISDB_DII_CHANGED      , "Process_L3_event" ,       Process_L3_event_dii_changed );
event_handlers[23] = new log_event_item( EVENT_DTV_ISDB_DATA_EVENT_MESSAGE , "Process_L3_event" ,       Process_L3_event_data_msg );
event_handlers[24] = new log_event_item( EVENT_DTV_ISDB_MODULE_CONSTRUCTION , "Process_L3_event" ,       Process_L3_event_module_recons );
event_handlers[25] = new log_event_item( EVENT_DTV_ISDB_PARSING_ERROR     , "Process_L3_event" ,       Process_L3_event_parsing_err );

event_handlers[26] = new log_event_item( EVENT_QTV_CLIP_ENDED     , "Process_QTV_event" ,       Process_QTV_event_clip_ended );
event_handlers[27] = new log_event_item( EVENT_QTV_DSP_INIT     , "Process_QTV_event" ,        Process_QTV_event_dsp_init );
event_handlers[28] = new log_event_item( EVENT_QTV_STREAMER_STATE_IDLE     , "Process_QTV_event" ,       Process_QTV_event_state_idle );
event_handlers[29] = new log_event_item( EVENT_QTV_STREAMER_STATE_CONNECTING     , "Process_QTV_event" ,        Process_QTV_event_state_conncting );
event_handlers[30] = new log_event_item( EVENT_QTV_STREAMER_STATE_SETTING_TRACKS     , "Process_QTV_event" ,       Process_QTV_event_state_setting_tracks );
event_handlers[31] = new log_event_item( EVENT_QTV_STREAMER_STATE_STREAMING     , "Process_QTV_event" ,        Process_QTV_event_state_streaming );
event_handlers[32] = new log_event_item( EVENT_QTV_STREAMER_CONNECTED     , "Process_QTV_event" ,       Process_QTV_event_state_streamer_connected );
event_handlers[33] = new log_event_item( EVENT_QTV_STREAMER_INITSTREAM_FAIL     , "Process_QTV_event" ,        Process_QTV_event_state_init_stream_fail );  

event_handlers[34] = new log_event_item( EVENT_QTV_BUFFERING_STARTED     , "Process_QTV_event" ,       Process_QTV_event_buffering_started );
event_handlers[35] = new log_event_item( EVENT_QTV_BUFFERING_ENDED     , "Process_QTV_event" ,        Process_QTV_event_buffering_ended );
  

 
											// DispatchID DispatchCode name  process_function;
											
  subsys_responses[0] = new subsys_response_item( 38, 253, "QTV/Framework API Command Response",   ProcessQtvApiCommandResponse );
  subsys_responses[1] = new subsys_response_item( 38, 254, "QTV/Framework Stop Command Response",  ProcessQtvFrameworkStopResponse );
 subsys_responses[2] = new subsys_response_item( 38, 255, "QTV/Framework Start Command Response", ProcessQtvFrameworkStartResponse );


  subsys_responses[3] = new subsys_response_item( 19, 2    ,"EFS2/DIAG Open Response",            ProcessEfs2OpenResponse );
  subsys_responses[4] = new subsys_response_item( 19, 3    ,"EFS2/DIAG Close Response",           ProcessEfs2CloseResponse );
  subsys_responses[5] = new subsys_response_item( 19, 5    ,"EFS2/DIAG Write Response",           ProcessEfs2WriteResponse );
  subsys_responses[6] = new subsys_response_item( 19, 8    ,"EFS2/DIAG Unlink Response",          ProcessEfs2UnlinkResponse );
  subsys_responses[7] = new subsys_response_item( 19, 11   ,"EFS2/Open Dir Response",           ProcessEfs2OpenDirResponse );
  subsys_responses[8] = new subsys_response_item( 19, 9    ,"EFS2/Create Dir Response",          ProcessEfs2CreateDirResponse );
  subsys_responses[9] = new subsys_response_item( 44, 240 , "DTV/L1 Command Response",           ProcessUBMSubsystemResponse );


  qtv_api_response_handlers[0] = new qtv_api_cmd_item( 1,  ProcessQtvFrameworkInitResponse );
  qtv_api_response_handlers[1] = new qtv_api_cmd_item( 2,  ProcessQtvRegisterCbResponse );
  qtv_api_response_handlers[2] = new qtv_api_cmd_item( 3,  ProcessQtvOpenUrlResponse );
  qtv_api_response_handlers[3] = new qtv_api_cmd_item( 7,  ProcessQtvPlayClipResponse );
  qtv_api_response_handlers[4] = new qtv_api_cmd_item( 10, ProcessQtvStopPlaybackResponse );
}
/////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////
function ResetVersionTable()
{
	IsReceivedFWversion = false;
	IsReceivedHWVersion = false ; 
	gui_front.sw_version.innerHTML = "---";
	gui_front.tech.innerHTML= "---";
	gui_front.fw_version.innerHTML= "---";
	gui_front.GamlaChipType.innerHTML= "---";
	gui_front.RFChipType.innerHTML= "---";
	gui_front.BBChipType.innerHTML= "---";
}

/////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////
function disableAllPanel()
{
	DisableRadios();
	DisableButton(gui_front.ResetCountersButton);
	 DisableButton(gui_front.ScanButton) ; 
	DisableButton(gui_front.StartTestButton);
	DisableButton(gui_front.StopTestButton); 
	DisableControlButtons();
}
//////////////////////////////////////////////////////////////////////////
function EnableAllPanel()
{
	EnableRadios();
	EnableButton(gui_front.ResetCountersButton , 'navy');
	EnableButton(gui_front.ScanButton, 'navy');
	EnableButton(gui_front.StartTestButton);
    EnableButton(gui_front.StopTestButton);
	EnableControlButtos();
}

 
//////////////////////////////////////////////////////////////////////////
function SelectFreqSetupType(value )
{
	FreqSetupType = value;

	gui_front.ChannelNumberSelect.innerHTML="";     
	
	switch (FreqSetupType )
	{
		case BY_REGION_FREQS :  
		{
			 DisableButton(gui_front.ScanButton) ;
			break ;  
		}
		case SCANED_FREQS :  
		{
			EnableButton(gui_front.ScanButton, 'navy');
			break ;  
		}
	}

PopulateAvailableFrequency();
}
/////////////////////////////////////////////////////////////////////////////////////////////
function SelectRegion( value )
{
 
	Region = value;
	start_chan   = getStartChannelByRegion() ; 
	end_chan	= getEndChannelByRegion() ; 

	PopulateAvailableFrequency();
}
/////////////////////////////////////////////////////////////////////////////////////////////
function GetFreqFromChannelNumber( ch_num )
{
  
  if (ch_num== 0)
  {
	alert("Frequency was not detected... \nPlease Perform 'SCAN' or choose 'All Channels'");
	return 0 ;
  }
  
  var start_freq = 473e06;

  var freq = start_freq + (1e06 / 7) + ((ch_num - start_chan) * 6e06);

  return( freq );
}
/////////////////////////////////////////////////////////////////////////////////////////////
function GetCurrentFrequency()
{
   var freq = GetFreqFromChannelNumber( gui_front.ChannelNumberSelect.value ); 
   
   return( freq.toFixed(0) );
}// close function GetCurrentFrequency
/////////////////////////////////////////////////////////////////////////////////////////////

function getStartChannelByRegion()
{
	switch (Region)  
	{
		case REGION_BRAZIL :
		{
			var start_chan = REGION_BRAZIL_StartChan;
			break ; 
		}

		case REGION_JAPAN : 
		{
			var start_chan = REGION_JAPAN_StartChan; 
			break ;    
		}
	}
	return start_chan ; 
}
//////////////////////////////////////////////////

function getEndChannelByRegion() 
{ 
	switch (Region)  
	{
		case REGION_BRAZIL :
		{
			var end_chan = REGION_BRAZIL_EndChan;
			break ; 
		}

		case REGION_JAPAN : 
		{
			var end_chan = REGION_JAPAN_EndChan;
			break ;    
		}
	}

	return end_chan ; 
}
////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////
function TimerGetElapsedTime()
{
  return ; 
  /*
   if( TestRunning )
   {
      var d = new Date();
      var now = d.getTime();

      var elapsed_time = now - TestStartTime;

      var date = new Date(elapsed_time);
      //var timestr = date.getUTCHours() +":"+ date.getMinutes()+":"+date.getSeconds();
      var timestr = date.toUTCString();

      var split = timestr.split(" ",5);

      gui_front.ElapsedTestTime.innerText = split[4];
   }
   else
   {
      gui_front.ElapsedTestTime.innerText = "00:00:00";
   }
   */
}
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
function SelectPhyOnly()
{
	TestType = PHY_TEST_TYPE;
	gui_front.DataLayerTable.style.display = "none" ; 
	gui_front.VideoParamsTable.style.display = "none" ; 

	 RefreshGUI();
}
/////////////////////////////////////////////////////////////////////////////////////
function onclickStartTest()
{
 
	 DisableButton(gui_front.StartTestButton);
	TimerStart();
	switch (TestType)
	{
		case  PHY_TEST_TYPE :
		{
			StartPhyTest() ; 
			break ;
		}

		case  VIDEO_TEST_TYPE :
		{
			StartVideoPlayback() ; 
			break ;
		}

	}// close switch
}
/////////////////////////////////////////////////////////////////////////////////////
function onclickStopTest()
{
	DisableButton(gui_front.StopTestButton);
	TimerStop();
	ResetCountersDisplay();
	ResetPhyParamsTable();
	ResetTrackingParamsTable();
	ResetAcquisitionTable() ;  
	gui_front.status_frequency.innerHTML = "---" ; 
	
	switch (TestType)
	{
		case  PHY_TEST_TYPE  :
		{
		StopPhyTest() ; 
		break ;
		}

	case  VIDEO_TEST_TYPE  :
		{
		stopVideoPlayback() ; 
		break ;
		}

	}// close switch
}
/////////////////////////////////////////////////////////////////////////////////////

function SelectVideo()
{

	TestType = VIDEO_TEST_TYPE;
	gui_front.DataLayerTable.style.display = "inline" ; 
	gui_front.VideoParamsTable.style.display = "inline" ; 

	RefreshGUI() ; 

}
/////////////////////////////////////////////////////////////////////////////////////

function GetFrameSizeText( frame_size )
{
   switch( frame_size )
   {
      case 0:
      return "256 rows";
      case 1:
      return "512 rows";
      case 2:
      return "768 rows";
      case 3:
      return "1024 rows";
      case 4:
      return "None";
   }
}

/////////////////////////////////////////////////////////////////////////////////////
function TimerReset()
{
  var d = new Date();

  TestStartTime = d.getTime();
}
/////////////////////////////////////////////////////////////////////////////////////
function TimerStart()
{
  TimerReset();

  TestRunning = true;
}
/////////////////////////////////////////////////////////////////////////////////////
function TimerStop()
{
  TestRunning = false;
}

/////////////////////////////////////////////////////////////////////////////////////

function StartPhyTest()
{
   phy_test_is_running = true;
   gui_did_powerup = false ; 
  
 
	if (curr_state_num == 0 )
	{
		L1_powerup() ; 
	}else
	{
		L1_powerdown();
	}
   
   
   RefreshGUI();
  
  
}
/////////////////////////////////////////////////////////////////////////////////////
function StopPhyTest()
{
    gui_did_powerup = false ; 
	phy_test_is_running = false;

	L1_StopDSP() ;
	L1_powerdown();
	RefreshGUI();
}
/////////////////////////////////////////////////////////////////////////////////////
function StartVideoPlayback( )
{

   video_test_is_running = true; 
   RefreshGUI() ;
   ResetCountersDisplay();
    
   var freq = GetCurrentFrequency();
   if (freq==0)  { return ;   }
   
   efs2_filename = "/mod/mediaplayer/media/"+freq.toString()+".url"
   efs2_file_contents = "isdb://-frequency="+freq;

 // Start the QTV diag task
 //  QTV_Stop_Playback();

   Check_If_QTV_Config_File_is_Ready();

}

function Check_If_QTV_Config_File_is_Ready()
{
 checkingQTV_CFG_File = true; 
 EFS2_Open_File("/mod/mediaplayer/qtv_config.cfg", "O_RDONLY", 0);
}

////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////

function DisableRadios() 
{
	gui_front.radio_select_phy.disabled =true ; 
	gui_front.radio_select_video.disabled =true ; 
	gui_front.radio_select_brazil.disabled =true ; 
	gui_front.radio_select_japan.disabled =true ; 
	gui_front.radio_select_available_channels.disabled =true ; 
	gui_front.radio_select_all_channels.disabled =true ; 
	gui_front.ChannelNumberSelect.disabled=true ; 
} 
/////////////////////////////////////////////////////////////////////////////////////
function EnableRadios() 
{
	gui_front.radio_select_phy.disabled =false ; 
	gui_front.radio_select_video.disabled =false ; 
	gui_front.radio_select_brazil.disabled =false ; 
	gui_front.radio_select_japan.disabled =false ; 
	gui_front.radio_select_available_channels.disabled =false ; 
	gui_front.radio_select_all_channels.disabled =false ; 
	gui_front.ChannelNumberSelect.disabled=false ; 
} 
 /////////////////////////////////////////////////////////////////////////////////////
function DisableControlButtons()
{
	DisableButton(gui_front.PowerUpButton) ; 
	DisableButton(gui_front.PowerDownButton) ; 
	DisableButton(gui_front.AcquireButton) ; 
	DisableButton(gui_front.StopDSPButton); 
}	
/////////////////////////////////////////////////////////////////////////////////////
function EnableControlButtos()
{
	EnableButton(gui_front.PowerUpButton , 'green'); 
	EnableButton(gui_front.PowerDownButton, 'red'); 
	EnableButton(gui_front.AcquireButton, 'green'); 
	EnableButton(gui_front.StopDSPButton, 'red'); 
}	
/////////////////////////////////////////////////////////////////////////////////////
function StartScanTest()
{
	phy_test_is_running = true ; 
	DisableButton(gui_front.ResetCountersButton);
	
	DisableButton(gui_front.StartTestButton)  ;
	DisableButton(gui_front.StopTestButton) ;  
	DisableButton(gui_front.ScanButton) ; 
	DisableRadios() ; 
	DisableControlButtons();

	onclickResetCounters();
	
	RawDataContainer.Acq_status = "FAIL" ; 
	ValidFrequencies = new Array();
	ValidChannelNum = new Array();

	//TestRunningStatus.innerText = "Frequency Scan Started";

	/* Save the test type so when scan is complete, we can go back to it */
	OldTestType = TestType;
	TestType = SCAN_TEST_TYPE; 

	
	if (curr_state_num == 0 )
	{
		L1_powerup() ; 
	}else
	{
		L1_powerdown();
	}
	
	// Create and then open the scan file 
	//EFS2_Create_New_URL_File( isdb_scan_file, "isdb://scan", QTV_Open_URL, isdb_scan_file );
}
/////////////////////////////////////////////////////////////////////////////////////
function ScanComplete()
{
phy_test_is_running = false ; 
  //TestRunningStatus.innerText = "Frequency Scan Complete";

  // Restore the test type and read the scan results directory 
  TestType = OldTestType;
  
    EnableButton(gui_front.ResetCountersButton, 'navy' );
	EnableButton(gui_front.ScanButton ,'navy') ; 
	EnableRadios()  ;

  PopulateAvailableFrequency();


  ResetCountersDisplay();

  qtv_stop_playback_required = true;

}
/////////////////////////////////////////////////////////////////////////////////////
function onclickResetCounters()
{
   L1_reset_counters();

   ResetL3Counters();

   ResetCountersDisplay();

   TimerReset();
}
/////////////////////////////////////////////////////////////////////////////////////
function ResetL3Counters( )
{
  tps_reset_flag       = true;
  buffering_reset_flag = true;
  pes_reset_flag       = true;
  sections_reset_flag  = true;
}
/////////////////////////////////////////////////////////////////////////////////////
function ResetCountersDisplay( )
{
  gui_front.status_avg_vber.innerText = "---";
   gui_front.status_inst_vber.innerText = "---";
   gui_front.status_rs1_pkt_cnt.innerText = "---";
   gui_front.status_rs1_pkt_errors.innerText = "---";
   gui_front.status_rs1_per.innerText = "---";
   gui_front.status_esr_error.innerText = "---";
   gui_front.status_esr_total.innerText = "---";
   gui_front.status_esr_ratio.innerText = "---";


    gui_front.ts_pkt_error_rate.innerText = "---";
    gui_front.pes_pkt_error_rate.innerText = "---";
    gui_front.section_pkt_error_rate.innerText = "---";
    gui_front.video_overflow.innerText = "---";
    gui_front.video_underflow.innerText = "---";
    gui_front.video_discarded.innerText = "---";
    gui_front.audio_overflow.innerText = "---";
    gui_front.audio_underflow.innerText = "---";
    gui_front.audio_discarded.innerText = "---";
    gui_front.subtitles_overflow.innerText = "---";
    gui_front.subtitles_underflow.innerText = "---";
    gui_front.subtitles_discarded.innerText = "---";    


}
/////////////////////////////////////////////////////////////////////////////////////
function L1_StopDSP()
{
	L1_diag_cmd( UBM_L1_ISDB_RESET_CMD, "" );
}

function StartRecordTSIFPackets(value) 
{
/*
	value = String2Num(value) ; 
	var MSB = (value & 0xFF00 ) >> 8 ; 
	var LSB = (value & 0x00FF )<<8;
	var arg = LSB+ MSB ; 
*/	
	L1_diag_cmd(UBM_L1_ISDB_RECORD_TSIF_PACKETS_CMD, value );
}

/////////////////////////////////////////////////////////////////////////////////////
function L1_powerup()
{
 
  L1_diag_cmd( UBM_L1_POWERUP_CMD, "" );

  // TestRunningStatus.innerText = "Initialising Receiver";
}
/////////////////////////////////////////////////////////////////////////////////////
function L1_powerdown()
{

  L1_diag_cmd( UBM_L1_POWERDOWN_CMD, "" );
}
/////////////////////////////////////////////////////////////////////////////////////



function L1_acquire( frequency )
{
   var freq = 0 ; 
  if (frequency == undefined )
   {
    freq = GetCurrentFrequency() / 10;
    if (freq ==0 ) { return ;     }
  
  }else{
  
   freq = frequency / 10;
	}
  L1_diag_cmd( UBM_L1_ACQ_CMD, freq.toFixed(0) );
  
}

/////////////////////////////////////////////////////////
function L1_set_cfg_item( CfgItem, Val )
{
  var cmd_str = "0 " + CfgItem + " " + Val;

  L1_diag_cmd( UBM_L1_CFG_ITEM, cmd_str);
}
/////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////
function ProcessEvents( Item )
{
 
  var event_ID  = GetItemID(Item) ; 
 
  for( var i=0; i< event_handlers.length; i++ )
  {
    if( event_ID == event_handlers[i].ID &&  event_handlers[i].process_function )
    {
      event_handlers[i].process_function( Item );
      break ; 
    }
  }
TimerGetElapsedTime() ; 

}

/////////////////////////////////////////////////////////////////////////////////////
function ProcessDtvTableAcqEvent( Item )
{

  var Fields = Item.GetItemFields();
if (Fields == null) {return ;   }

 if( isTestVideo() && video_test_is_running )
 {
   if( Fields.GetFieldValueText(0) == "PMT" )
   {
     //TestRunningStatus.innerText = "ISDB-T Video found";             
     QTV_Play();
   }
 }
}

// Process outgoing commands
function ProcessSubsystemRequests( Item )
{
   var Fields = Item.GetItemFields();
    if (Fields == null) {return ;   }
   TimerGetElapsedTime();
}
/////////////////////////////////////////////////////////////////////////////////////
// Process response/state string client
function ProcessSubsystemResponses( Item )
{
  
    var Fields = Item.GetItemFields();
    if (Fields == null) {return ;   }

    var cmdId              = Fields.GetFieldValue( 1); 
    if( cmdId == 110 )
    {
		Process1BitStatusCommand(Fields);
	return ; 	
   }  
  
  var item_name = Item.GetItemName();


   for( var i=0; i < subsys_responses.length; i++ )
   {
     if( item_name == subsys_responses[i].name &&   subsys_responses[i].process_function )
     {
       subsys_responses[i].process_function( Item );
        break ;
     }
   }
   
TimerGetElapsedTime();
}/////////////////////////////////////////////////////////////////////////////////////

function Process1BitStatusCommand(Fields)
	{

	oneBitResponseCount++;
	var IsTestDone = Fields.GetFieldValue( 2); 		
	//gui_front.oneBitDone.innerText=IsTestDone;
	
	var NumOfOnesCounted = Fields.GetFieldValue( 3); 		
	
	gui_front.ZeroPayloadOnesCount.innerText = NumOfOnesCounted;
	var NumOfGoodPackets = Fields.GetFieldValue( 4); 		
	gui_front.ZeroPayloadGoodPacketsCount.innerText = NumOfGoodPackets;
	var VberVal = NumOfOnesCounted/(NumOfGoodPackets*8*184);
	
	//VberVal /= 4294967296;
	//if( VberVal < 1e-7 )
	//{
	//	oneBitVber.innerText = "< 1e-7 ";
	//}
	//else
	//{
	//	oneBitVber.innerText = VberVal.toExponential(4);
	//}


	gui_front.ZeroPayloadVber.innerText = VberVal.toExponential(3);



	if( IsTestDone == false && ( oneBitResponseCount%2==0) )
	IQXDM2.RequestItem( DTV_L1_CMD, "110",true, TIMEOUT_MS, 2, 1000 );  //loop on status  for one minute

	else if( IsTestDone == true )     //1bit test finished and a new one can still run since the we are still in traffic
	{
	
	testZeroPayloadIsRunning = false ; 
	 RefreshGUI();
	}
	

}

/////////////////////////////////////////////////////////////////////////////////////
// Process response/state string client
function ProcessStrings( Item )
{

   // Check for a state notification
   var ItemKey = Item.GetItemKeyText();

   if( ItemKey == STATE )
   {
      ServerState = IQXDM2.GetServerState();
   
		if (ServerState != SVR_STATE_CONNECTED) 
		{
			curr_state_num = 101 ; 
			
			RawDataContainer = new Object();
			AllocateAllArrays() ; 
			ResetAllGUITables() ; 	
			ResetL3Counters();
	        disableAllPanel() ; 
	        UpdateStateMachineDisplay();
			RefreshGUI();
			IsReceivedFWversion = false;
			IsReceivedHWVersion = false ; 	
			
			return ; 
		}  
		
		 if (ServerState == SVR_STATE_CONNECTED) 
		{ 
		  RawDataContainer = new Object();
		  Register() ; 
		}  

   }
//TimerGetElapsedTime();
 
}
/////////////////////////////////////////////////////////////////////////////////////
function ResetAllGUITables() 
{
    ResetPhyParamsTable();
	ResetTrackingParamsTable();
	ResetAcquisitionTable();
	ResetCountersDisplay();
	TimerReset();
	ResetVersionTable();
	
	gui_front.status_frequency.innerText   ="---"
} 
/////////////////////////////////////////////////////////////////////////////////////
function ProcessMessages( Item )
{
 
if (test_record_in_active) 
{
	if (Item.GetItemSummary() =="    tsif_drv_api.c  00350  tsif_drv_stop successful" )
	{
      test_record_in_active  = false; 
      EnableButton(gui_front.StartRecordTSIFPacketsButton,'navy') ;
	}
//	 debugger; 
	var msg = Item.GetItemSummary();
	if (StringHasSubstr(msg , "ts_drv_get_next_buffer_info_from_last_get returned")) 
{
		var idx = msg.indexOf("now");
		idx = msg.indexOf("(" , idx+2);
		var end_idx = msg.indexOf(")" , idx);
		var len = end_idx - idx -1  ; 
		gui_front.curr_num_tsif_pkt.innerText = msg.substr(idx +1, len)/96*18; 
		if (str2num(msg.substr(idx +1, len))/96*18 >= gui_front.numOfTISFPackets.value ) 
	{
		 test_record_in_active  = false; 
		  EnableButton(gui_front.StartRecordTSIFPacketsButton,'navy') ;
	}
}
	
}

   
}
/////////////////////////////////////////////////////////////////////////////////////
function ProcessLogs( Item )
{

  var LogID = GetItemID(Item) ; 
 

  for( var i=0; i < log_items.length; i++ )
  {
    if( LogID == log_items[i].ID    &&     log_items[i].process_function )
    {
       log_items[i].process_function( Item  ); 
       break;      
    }
  }


TimerGetElapsedTime();
}
/////////////////////////////////////////////////////////////////////////////////////
function processQTV_AV_Sync_Log(Item)
{
if ((avs_cnt++ % 110) == 0 )
 {

getRawDataFromQTV_AV_Sync( Item  ) ; 
PopulateQTV_AV_Sync(gui_front.QTV_AV_Sync);
}
}
/////////////////////////////////////////////////////////////////////////////////////
function processQTV_Render_Log(Item)
{
	if (!EVENT_QTV_CLIP_STARTED_received) 
	{
	Process_EVENT_QTV_CLIP_STARTED(Item); 
	return ; 
	}
	
	getRawDataFromQTV_Frame_render_info( Item  ) ; 
	 checkFPS_ts=	Item.GetItemSpecificTimestampText(0,0);
}
/////////////////////////////////////////////////////////////////////////////////////
function ProcessTSPLog( Item  )
{
  var Fields = Item.GetItemFields();
   if (Fields == null) {return ;   }

  var ts_packets       = Fields.GetFieldValue( 1 );
  var error_bit_set    = Fields.GetFieldValue( 2 );

  if( tps_reset_flag )
  {
     error_bit_set_reset_value = error_bit_set;
     ts_packets_reset_value   = ts_packets;

     tps_reset_flag = false;
  }

  error_bit_set -= error_bit_set_reset_value;
  ts_packets    -= ts_packets_reset_value;

  if( ts_packets > 0 )
  {
    var ts_per = ( error_bit_set * 100 ) / ts_packets;
    gui_front.ts_pkt_error_rate.innerText = ts_per.toFixed(2) + "%";
  }

}
/////////////////////////////////////////////////////////////////////////////////////

function ProcessPESLog( Item )
{
 
  var Fields = Item.GetItemFields();
  if (Fields == null) {return ;   }

  var pes_packets         = Fields.GetFieldValue( 1 );
  var bad_pes_packets     = Fields.GetFieldValue( 3 );

  if( pes_reset_flag )
  {
     bad_pes_packets_reset_value = bad_pes_packets;
     pes_packets_reset_value   = pes_packets;

     pes_reset_flag = false;
  }

  bad_pes_packets -= bad_pes_packets_reset_value;
  pes_packets     -= pes_packets_reset_value;

  if( pes_packets > 0  )
  {
    var pes_per =  ( bad_pes_packets * 100 ) / pes_packets;
    gui_front.pes_pkt_error_rate.innerText = pes_per.toFixed(2) + "%";
  }
}

/////////////////////////////////////////////////////////////////////////////////////

function ProcessSectionsLog( Item )
{
  var Fields = Item.GetItemFields();
  if (Fields == null) {return ;   }

  var sections            = Fields.GetFieldValue( 1 );
  var bad_sections        = Fields.GetFieldValue( 4 );
  var crc_errors          = Fields.GetFieldValue( 5 );

  if( sections_reset_flag )
  {
     bad_sections_reset_value = bad_sections;
     crc_errors_reset_value   = crc_errors;
     sections_reset_value     = sections;

     sections_reset_flag = false;
  }

  bad_sections -= bad_sections_reset_value;
  crc_errors   -= crc_errors_reset_value;
  sections     -= sections_reset_value;

  if( sections > 0  )
  {
    var section_per = ( ( bad_sections + crc_errors ) * 100 ) / sections;
    gui_front.section_pkt_error_rate.innerText = section_per.toFixed(2) + "%";
  }

}

/////////////////////////////////////////////////////////////////////////////////////
function ProcessBufferingLog( Item )
{

  var Fields = Item.GetItemFields();
  if (Fields == null) {return ;   }

  var version                   = Fields.GetFieldValue( 0 );
  var video_overflows           = Fields.GetFieldValue( 1 );
  var audio_overflows           = Fields.GetFieldValue( 2 );
  var subtitles_overflows       = Fields.GetFieldValue( 3 );
  var discard_video_oflow       = Fields.GetFieldValue( 4 );
  var discard_audio_oflow       = Fields.GetFieldValue( 5 );
  var discard_subtitles_oflow   = Fields.GetFieldValue( 6 );
  var video_underflows          = Fields.GetFieldValue( 7 );
  var audio_underflows          = Fields.GetFieldValue( 8 );
  var subtitles_underflows      = Fields.GetFieldValue( 9 );

  if( buffering_reset_flag )
  {
    video_overflows_reset_value = video_overflows;
    audio_overflows_reset_value = audio_overflows;
    subtitles_overflows_reset_value = subtitles_overflows;

    video_underflows_reset_value = video_underflows;
    audio_underflows_reset_value = audio_underflows;
    subtitles_underflows_reset_value = subtitles_underflows;

    discard_video_oflow_reset_value = discard_video_oflow;
    discard_audio_oflow_reset_value = discard_audio_oflow;
    discard_subtitles_oflow_reset_value = discard_subtitles_oflow;

    buffering_reset_flag = false;
  }

  video_overflows     -= video_overflows_reset_value;
  audio_overflows     -= audio_overflows_reset_value;
  subtitles_overflows -= subtitles_overflows_reset_value;

  video_underflows     -= video_underflows_reset_value;
  audio_underflows     -= audio_underflows_reset_value;
  subtitles_underflows -= subtitles_underflows_reset_value;

  discard_video_oflow     -= discard_video_oflow_reset_value;
  discard_audio_oflow     -= discard_audio_oflow_reset_value;
  discard_subtitles_oflow -= discard_subtitles_oflow_reset_value;

if (video_overflows> video_overflows_reset_value ||audio_overflows> audio_overflows_reset_value ) 
{
	AV_overflow_happend         = true; 
	video_overflows_reset_value = video_overflows ;
	audio_overflows_reset_value = audio_overflows;
}else{
	AV_overflow_happend         = false; 
}
  
  
  if ( video_underflows > video_underflows_reset_value ||audio_underflows > audio_underflows_reset_value )
  {
     AV_underflow_happend         = true; 
     video_underflows_reset_value = video_underflows ; 
     audio_underflows_reset_value = audio_underflows ; 
  }else{
	AV_underflow_happend         = false; 
}


if( discard_video_oflow > discard_video_oflow_reset_value || discard_audio_oflow > discard_audio_oflow_reset_value)
{
discard_video_oflow_reset_value= discard_video_oflow;
discard_audio_oflow_reset_value= discard_audio_oflow ;
}else{
	AV_discard_happend         = false; 
}
 
 
    gui_front.video_overflow.innerText     = video_overflows;
    gui_front.audio_overflow.innerText     = audio_overflows;
    gui_front.subtitles_overflow.innerText = subtitles_overflows;
    
    gui_front.video_underflow.innerText     = video_underflows;
    gui_front.audio_underflow.innerText     = audio_underflows;
    gui_front.subtitles_underflow.innerText = subtitles_underflows;
    
    gui_front.video_discarded.innerText     = discard_video_oflow;
    gui_front.audio_discarded.innerText     = discard_audio_oflow;
    gui_front.subtitles_discarded.innerText = discard_subtitles_oflow;
 

}
/////////////////////////////////////////////////////////////////////////////////////
function ProcessAcquisitionLog(Item)
{
	
	   getRawDataFRomSubPktID(  Item ,   RF_DATA_SBPKT_ID  ) ; 
	   getRawDataFRomSubPktID(  Item ,   CFB_SBPKT_ID  ) ; 
       getRawDataFRomSubPktID(  Item ,   AGC_SBPKT_ID  ) ; 
	   IsReceivedHWVersion = false ;  
	   UpdateVersionTable(); 
	   populateVersionData();
	   UpdateAcquisitionTable();
   
}
/////////////////////////////////////////////////////////////////////////////////////
function ProcessChordStatusLog( Item  )
{
	if ((chord_cnt++ % 10 ) == 0 ) {
		getRawDataFromChordStatusLog(Item);
		populateChordStatus();
      }
}
/////////////////////////////////////////////////////////////////////////////////////
function ProcessChordTXactivityLog(Item)
{
//debugger; 
	getRawDataFromChordTXactivityLog(Item);
	populateConcurrentTxActivity();
}

/////////////////////////////////////////////////////////////////////////////////////
function populateChordStatus()
{
	
	
		//////  chord status : 
	if (gui_front.mixer_type.innerText  != ChOrdStatus.mixer_type ) 
	{
		gui_front.mixer_type.style.backgroundColor = 'red';
		 beep(gui_front.sound1);
		 gui_front.mixer_type.innerText  = ChOrdStatus.mixer_type;
	}else{
		gui_front.mixer_type.style.backgroundColor = ChOrdStatus.mixer_type == "SRM"  ? 'yellow' : 'Aqua';	
		
	}
	
	
	if (gui_front.chord_protection_active.innerText  != ChOrdStatus.protection_active ) 
	{
		gui_front.chord_protection_active.style.backgroundColor = 'red';
		gui_front.chord_protection_active.style.color = 'white';
		 beep(gui_front.sound1);
		 gui_front.chord_protection_active.innerText  = ChOrdStatus.protection_active;
	}else{
		gui_front.chord_protection_active.style.backgroundColor = ( ChOrdStatus.protection_active == "ACTIVE" ? 'green' : 'white');
		gui_front.chord_protection_active.style.color = ( ChOrdStatus.protection_active == "ACTIVE" ? 'white' : 'black');
	}
	
	if (ChOrdStatus.protection_active == "ACTIVE")
		 {
			gui_front.enable_HRM.disabled = false ; 
			gui_front.goto_jd_m2.disabled = false ; 
			gui_front.enable_HRM_t.disabled = false ; 
			gui_front.goto_jd_m2_t.disabled = false ;
			 gui_front.ProtectionAction_t.disabled = false ;
		}else{
	//debugger; 
			gui_front.enable_HRM.disabled = true ; 
			gui_front.goto_jd_m2.disabled = true ;
			gui_front.enable_HRM_t.disabled = true ; 
			gui_front.goto_jd_m2_t.disabled = true ;
			 gui_front.ProtectionAction_t.disabled = true ;
		}
	
	//////  protection_info
	if (gui_front.concurrent_tx_active.innerText  != protection_info.concurrent_tx_active ) 
	{
		gui_front.concurrent_tx_active.style.backgroundColor = 'red';
		gui_front.concurrent_tx_active.style.color = 'white';
		 beep(gui_front.sound1);
		 gui_front.concurrent_tx_active.innerText  = protection_info.concurrent_tx_active;
	}else{
		
		gui_front.concurrent_tx_active.style.backgroundColor = (protection_info.concurrent_tx_active== "ACTIVE" ? 'green' : 'white');	
		gui_front.concurrent_tx_active.style.color = (protection_info.concurrent_tx_active== "ACTIVE" ? 'white' : 'black');	
	}
	
	if ( protection_info.concurrent_tx_active == "ACTIVE" )
	 {
		gui_front.concurrent_tx_pwr_t.disabled = false; 
		gui_front.concurrent_tx_pwr.disabled = false; 
		gui_front.concurrent_tx_freq_t.disabled = false; 
		gui_front.concurrent_tx_freq.disabled = false; 
	 }else{
		gui_front.concurrent_tx_pwr_t.disabled = true; 
		gui_front.concurrent_tx_pwr.disabled = true; 
		gui_front.concurrent_tx_freq_t.disabled = true; 
		gui_front.concurrent_tx_freq.disabled = true; 
	
	}
	
	
	
	if (protection_info.tx_pow_defined && protection_info.tx_freq_defined  && protection_info.tx_freq_MHz != 0) 
	{
		if (gui_front.concurrent_tx_pwr.innerText  == "NA") 
		{
			beep(gui_front.sound1);
			gui_front.concurrent_tx_pwr.style.backgroundColor = 'red';
			gui_front.concurrent_tx_freq.style.backgroundColor = 'red';
		}else{
		    gui_front.concurrent_tx_pwr.style.backgroundColor = 'white';
			gui_front.concurrent_tx_freq.style.backgroundColor = 'white';
		
		}
		
		var concurrent_channel             = ( (protection_info.tx_freq_MHz - 1710.2)/0.2 + 512 ).toFixed(0) ; 
		gui_front.concurrent_tx_pwr.innerText  = protection_info.tx_pwr_dbm + " [dBm]" ;
        gui_front.concurrent_tx_freq.innerText =  protection_info.tx_freq_MHz + " [MHz] (" + concurrent_channel+ ")";	
	}else{
		gui_front.concurrent_tx_pwr.innerText  = "NA";
		gui_front.concurrent_tx_freq.innerText  = "NA";
	}
	
	
	gui_front.goto_jd_m2.innerText  = protection_action.goto_jd_mode2 ? "TRUE" : "FALSE" ;       
	gui_front.enable_HRM.innerText = protection_action.enable_hrm   ? "TRUE" : "FALSE" ; 
	
}// close function
///////////////////////////////////////////////////////////////////////
function populateConcurrentTxActivity()
{
	//debugger; 	
	if (gui_front.tx_about_to_start.innerText  != concurent_tx_info.tx_about_to_start.toString() ) 
		{
			gui_front.tx_about_to_start.style.backgroundColor = 'red';
			beep(gui_front.sound1);
			gui_front.tx_about_to_start.innerText = concurent_tx_info.tx_about_to_start;
		}else{
			gui_front.tx_about_to_start.style.backgroundColor = concurent_tx_info.tx_about_to_start=="ACTIVE" ?'blue' : 'white';		
			gui_front.tx_about_to_start.style.color = concurent_tx_info.tx_about_to_start=="ACTIVE" ?'white' : 'black';		
		}
		
	
	gui_front.concurent_pwr.innerText  =  concurent_tx_info.tx_pwr_dbm+ " [dBm]";  
	
		
	if ( concurent_tx_info.tx_freq_defined && concurent_tx_info.tx_about_to_start =="ACTIVE")
	{
		gui_front.concurent_freq.innerText = concurent_tx_info.tx_freq_MHz ; 
	}else if (concurent_tx_info.num_hopping_freq !=0 ){
		gui_front.concurent_freq.innerText = concurent_tx_info.hopping_freq_array[0] +","+ concurent_tx_info.hopping_freq_array[1]+ ","+ concurent_tx_info.hopping_freq_array[2]+"..." ; 
	}else{
		gui_front.concurent_freq.innerText = "NA" ; 
	}	
		
	gui_front.tech_mask.innerText = concurent_tx_info.tech_mask ; 
	
	if (concurent_tx_info.tx_about_to_start =="ACTIVE") 
	{
		gui_front.tech_mask_t.disabled = false ; 
		gui_front.tech_mask.disabled = false ; 
		gui_front.concurent_freq_.disabled = false ; 
		gui_front.concurent_freq.disabled = false ; 
			gui_front.concurent_pwr_t.disabled = false ; 
			gui_front.concurent_pwr.disabled = false ; 
	}else{
		gui_front.tech_mask_t.disabled = true ; 
		gui_front.tech_mask.disabled = true ; 
		gui_front.concurent_freq_.disabled = true ; 
		gui_front.concurent_freq.disabled = true ; 
		gui_front.concurent_pwr_t.disabled = true ; 
			gui_front.concurent_pwr.disabled = true ; 
	
	}
	
	
}// close function 

////////////////////////////////////////////////////////////////////////////////////////////////

function ProcessL1LogItem( Item  )
{ 
if((status_cnt++ % 3 ) == 0 ) 
{
    getRawDataFRomSubPktID(  Item ,   SIGNAL_QUALITY_SBPKT_ID    ) ; 
	getRawDataFRomSubPktID(  Item ,   TRACKING_LOOP_SBPKT_ID  ) ; 
	getRawDataFRomSubPktID(  Item ,   STATUS_SBPKT_ID  ) ; 
	getRawDataFRomSubPktID(  Item ,   MEAS_INFO_SBPKT_ID  ) ; 
	getRawDataFRomSubPktID(  Item ,   DOPPLER_SBPKT_ID  ) ; 


	UpdatePhyParamsTable() ; 
	UpdateAcquisitionTable();
	UpdateTrackingParamsTable() ; 
}
}// close function ProcessL1LogItem
/////////////////////////////////////////////////////////////////////////////////
function UpdateAcquisitionTable()
   {
     gui_front.status_frequency.innerText   =  (RawDataContainer.freq_mhz != undefined )?  RawDataContainer.freq_mhz.toFixed(3) : "---";
		
if( RawDataContainer.Acq_status != undefined && RawDataContainer.Acq_status == "SUCCESS" )
  {
    gui_front.status_fft_mode.innerText    = RawDataContainer.mode;
    gui_front.status_guard.innerText       = RawDataContainer.guard;
    gui_front.status_modulation.innerText  = RawDataContainer.modulation_type;
    gui_front.status_code_rate.innerText   = RawDataContainer.code_rate_str;
	gui_front.status_interleaver.innerText = RawDataContainer.interleaver_length;
	gui_front.xo_freq_err.innerText        = RawDataContainer.XO_frequency_error != undefined ? RawDataContainer.XO_frequency_error.toFixed(3) : "---" ;
	
  
 } else {
     
     ResetAcquisitionTable();
     ResetCountersDisplay( );
     ResetTrackingParamsTable(); 
   }
   
   ShowStatusRSSI();  
	ShowAJDMode();
	
	if(RawDataContainer.AjdM1NumAcqRetriesLeftInMode != undefined) {
	gui_front.num_acq_retries_left.innerText = RawDataContainer.AjdM1NumAcqRetriesLeftInMode ; 

	gui_front.no_signal_timer.innerText    = ( RawDataContainer.NoSignalTimerMsec  / 1000 ).toFixed(0);
  }
 //debugger; 
   if (AcqStruct.resampler_en )
    {
   gui_front.xo_freq_err.disabled = false; 
    gui_front.xo_freq_err_t.disabled = false; 
   }else{

   gui_front.xo_freq_err.disabled = true; 
    gui_front.xo_freq_err_t.disabled = true; 
   }
   
   
   }// close function UpdateAcquisitionTable()
   //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function ResetAcquisitionTable()
{
	gui_front.status_gain_state.innerText = "---";
	//gui_front.status_rssi.innerText       = "---";
	gui_front.status_fft_mode.innerText    = "---";
	gui_front.status_guard.innerText       = "---";
	gui_front.status_modulation.innerText  = "---";
	gui_front.status_code_rate.innerText   = "---";
	gui_front.status_interleaver.innerText = "---";
}
 
function ShowStatusRSSI()
{
if (RawDataContainer.status_rssi == undefined) { return ; }
	gui_front.status_rssi.innerText    = RawDataContainer.status_rssi.toFixed(2);

	if( RawDataContainer.status_rssi > -90 )
	{
		gui_front.status_rssi.style.backgroundColor = '';
	}
	else if( RawDataContainer.status_rssi < -95 )
	{
		gui_front.status_rssi.style.backgroundColor = 'red';
	}
	else
	{
		gui_front.status_rssi.style.backgroundColor = 'yellow';
	}
}  

/////////////////////////////////////////////////////////////////////////////////
function UpdatePhyParamsTable()
{

ShowStatusRSSI() ;
	
if(RawDataContainer.Acq_status != undefined && RawDataContainer.Acq_status == "SUCCESS" && RawDataContainer.status_rssi != undefined)
  {
		
	   gui_front.AdcLevel.innerText	= (RawDataContainer.AdcLevel).toFixed(2) ; 
	  
	   gui_front.status_gain_state.innerText = RawDataContainer.LNA_state;

		gui_front.status_rs1_pkt_cnt.innerText    = RawDataContainer.NumRsPkts;
		
		if(str2num(gui_front.status_rs1_pkt_errors.innerText) != RawDataContainer.NumRSTrashPkts )
		{
		    gui_front.status_rs1_pkt_errors.style.backgroundColor = 'red';
		     beep(gui_front.sound1);
		}else{
		    gui_front.status_rs1_pkt_errors.style.backgroundColor = 'white';
		}
		
		
		gui_front.status_rs1_pkt_errors.innerText = RawDataContainer.NumRSTrashPkts  ;
		
		var rs1_per                               = RawDataContainer.NumRSTrashPkts  / RawDataContainer.NumRsPkts;

		if( !isNaN(rs1_per ) )
		{
			if (rs1_per > 0.05)
			 {
				gui_front.status_rs1_per.style.backgroundColor = 'red';
			}else{
				gui_front.status_rs1_per.style.backgroundColor = 'white';
			}
			
			
			gui_front.status_rs1_per.innerText = rs1_per.toExponential(3);
		}

	
		gui_front.NumPreViterbiBitErrs.innerText   = RawDataContainer.NumPreViterbiBitErrs ;     
		gui_front.NumViterbiPkts.innerText         = RawDataContainer.NumViterbiPkts ;
		
		gui_front.AveragePreViterbiBER.innerText   = RawDataContainer.AveragePreViterbiBER.toExponential(3) ;  
	
	
		var avg_vber =  RawDataContainer.AverageViterbiBer ; // 2^32
			
		if( avg_vber < 1e-7 )
		{
			gui_front.status_avg_vber.innerText = "< 1e-7 ";
		}
		else
		{
			gui_front.status_avg_vber.innerText = avg_vber.toExponential(3);
		}

		var inst_vber = RawDataContainer.InstViterbiBer   ;
		if( inst_vber < 1e-7 )
		{
			gui_front.status_inst_vber.innerText = "< 1e-7 ";
		}
		else
		{
			gui_front.status_inst_vber.innerText = inst_vber.toExponential(3);
		}

		if (gui_front.status_inst_vber > 2e-4)
		{
			gui_front.status_inst_vber.style.backgroundColor = 'red';
			 beep(gui_front.sound1);
		}else{
			gui_front.status_inst_vber.style.backgroundColor = 'white';
		}


		
	gui_front.status_esr_total.innerText = RawDataContainer.ESR_Total_Seconds ;
	gui_front.status_esr_error.innerText = RawDataContainer.ESR_Erroneous_Seconds;

	var esr_ratio = RawDataContainer.ESR_Erroneous_Seconds  / RawDataContainer.ESR_Total_Seconds  ; 

	gui_front.status_esr_ratio.innerText = esr_ratio.toFixed(2);
	
	
	ShowAJDMode();
		
	
	gui_front.snr_estimation.innerText = RawDataContainer.SNR_Estimation.toFixed(1)     ; 
	
	if (RawDataContainer.SNR_Estimation < 5)
		{
			gui_front.snr_estimation.style.backgroundColor = 'red';
			 beep(gui_front.sound1);
		}else if (RawDataContainer.SNR_Estimation < 8){
			gui_front.snr_estimation.style.backgroundColor = 'yellow';
		}else{
		gui_front.snr_estimation.style.backgroundColor = 'white';
		
		}

	
	if (RawDataContainer.AjdNumFramesInMode != undefined) 
	{
	gui_front.num_ofdm_frames_in_mode.innerText     =  RawDataContainer.AjdNumFramesInMode     ;
	gui_front.ajd_rel_cnt.innerText   	            = RawDataContainer.AjdMode2ReleaseCtr     ;
	gui_front.Ajd_rssi_thresh_skip_detect.innerText	= (RawDataContainer.AjdRssiThreshSkipDetect).toFixed(2)  ; 
	gui_front.Ajd_rssi_thresh_switch.innerText      = (RawDataContainer.AjdRssiThresModeSwitch).toFixed(2) ;
	}
	
	if (RawDataContainer.analog_JD_mode == 1)
	 {
	   gui_front.ajd_rel_cnt.disabled = true; 
      gui_front.ajd_rel_cnt_t.disabled = true; 	
	}else{
	   gui_front.ajd_rel_cnt.disabled = false; 
      gui_front.ajd_rel_cnt_t.disabled = false; 	
	
	}
	
	
		
}else{
		
		ResetPhyParamsTable();
			
	}

}// close function 
////////////////////////////////////////////////////////
function UpdateTrackingParamsTable() 
{

	if( RawDataContainer.Acq_status != undefined && RawDataContainer.Acq_status == "SUCCESS" )
	{
		gui_front.freq_offset.innerText       = RawDataContainer.freq_offset ;
		gui_front.Fap.innerText               = Math.floor(RawDataContainer.Fap * 21/16 ) ;
		gui_front.Lap.innerText               = Math.floor(RawDataContainer.Lap * 21/16 ) ;
		gui_front.adv_ret_acc.innerText       = Math.floor(RawDataContainer.adv_ret_acc * 63/64)  ;                
		gui_front.doppler.innerText           =  RawDataContainer.Max_Hold_Output; 
		if (RawDataContainer.CoarseDC_I[0] != undefined) 
		{
		gui_front.CoarseDC_I.innerText        = (RawDataContainer.CoarseDC_I[0]).toFixed(1)    ;
		gui_front.CoarseDC_Q.innerText        = (RawDataContainer.CoarseDC_Q[0]).toFixed(1) ;
		gui_front.FineDC_I.innerText          = (RawDataContainer.FineDC_I[0]).toFixed(1) ;	      
		gui_front.FineDC_Q.innerText          = (RawDataContainer.FineDC_Q[0]).toFixed(1)   ;
		}
		gui_front.channel_estimation_alg.innerText          = (RawDataContainer.selected_Channel_Est_alg ==0 ? "SPCE" : "ZFCE" )   ;
		gui_front.time_track_freeze_cnt.innerText          = RawDataContainer.TimeTrackFreezeCount  ; 	
	}else
	{
		//ResetTrackingParamsTable();	
	}

} 
////////////////////////////////////////////////////////////////////////
function ResetTrackingParamsTable()
{
	
	gui_front.freq_offset.innerText       = "---";
	gui_front.Fap.innerText               = "---";
	gui_front.Lap.innerText               = "---";
	gui_front.adv_ret_acc.innerText       = "---";
	gui_front.doppler.innerText            = "---";
	gui_front.CoarseDC_I.innerText        = "---";
	gui_front.CoarseDC_Q.innerText        = "---";
	gui_front.FineDC_I.innerText          = "---";	      
	gui_front.FineDC_Q.innerText          = "---";
	gui_front.channel_estimation_alg.innerText = "---";

}
////////////////////////////////////////////////////////
function ResetPhyParamsTable()
{ 
	//gui_front.status_rssi.style.backgroundColor = 'white';	
	//gui_front.status_rssi.innerText    = "---";
	gui_front.status_gain_state.innerText ="---";
	gui_front.AdcLevel.innerText    = "---";
	gui_front.status_rs1_pkt_cnt.innerText    ="---";
	gui_front.status_rs1_pkt_errors.innerText ="---";
	gui_front.status_rs1_per.innerText ="---";
	gui_front.status_inst_vber.innerText ="---";
	gui_front.status_avg_vber.innerText ="---";
	gui_front.status_esr_total.innerText ="---"; 
	gui_front.status_esr_error.innerText ="---"; 
	gui_front.status_esr_ratio.innerText ="---";
	gui_front.NumPreViterbiBitErrs.innerText   ="---";
	gui_front.NumViterbiPkts.innerText         ="---";
	gui_front.AveragePreViterbiBER.innerText ="---";
	gui_front.analog_JD_mode.innerText ="---";
	gui_front.snr_estimation.innerText="---";
	
	gui_front.num_ofdm_frames_in_mode.innerText =  "---"     ;
	gui_front.Ajd_rssi_thresh_skip_detect.innerText	    = "---"          ;
	gui_front.ajd_rel_cnt.innerText   	="---"     ;
	gui_front.Ajd_rssi_thresh_switch.innerText =   "---";
		

}

/////////////////////////////////////////////////////////////////////////////////////
 
///////////////////////////////////////////////////////////////

function RefreshGUI() 
{ 
	if (curr_state_num < 100)
	{
		gui_front.phone_state.innerText = "Phone Connected";
		gui_front.phone_state.style.backgroundColor = 'green';
	}else{
	  gui_front.phone_state.innerText = "Phone Disconnected";
      gui_front.phone_state.style.backgroundColor = 'red';
     	
	}
	
		/// ALL Buttons
	if (curr_state_num >=100) 
	{	
		disableAllPanel()
		DisableZeroPayloadTable() ;
		DisableRecordTSIFTable() ;	
		return ; 
	}
	

gui_front.build_id.innerText = CRM_Build ; 
 
 switch (TestType)
 {
	case  SCAN_TEST_TYPE : 
	{
	disableAllPanel();
	DisableButton(gui_front.StopMovieButton) ;
	DisableButton(gui_front.PlayMovieButton) ;
	DisableZeroPayloadTable() ;
	DisableRecordTSIFTable() ;	
	break ; 
	}

	
	case  VIDEO_TEST_TYPE : 
	{
	    DisableControlButtons(); 
	
	   if (curr_state_num >= 2) 
	  {	
		DisableRadios() ; 	
		EnableButton(gui_front.ResetCountersButton ,'navy') ; 
		EnableButton(gui_front.StopTestButton, 'red') ; 
		DisableButton(gui_front.PlayMovieButton) ;
		EnableButton(gui_front.StopMovieButton, 'red') ; 
		DisableButton(gui_front.StartTestButton);	
	}else{
		EnableRadios() ;
		DisableButton(gui_front.ResetCountersButton) ; 
		DisableButton(gui_front.StopTestButton) ;
		EnableButton(gui_front.PlayMovieButton,'green') ;
		DisableButton(gui_front.StopMovieButton) ;
		EnableButton(gui_front.StartTestButton,'green');
	 }
	  

	  
		break ; 
	}// close case Video
	 
	 
	case  PHY_TEST_TYPE : 
	{
		DisableButton(gui_front.PlayMovieButton) ;
		DisableButton(gui_front.StopMovieButton) ;
	
	
	 if (curr_state_num >= 2) 
	{	
		DisableRadios() ; 	
		EnableButton(gui_front.ResetCountersButton ,'navy') ; 
		EnableButton(gui_front.StopDSPButton,'red');	
		DisableButton(gui_front.StartTestButton);	
		EnableButton(gui_front.StopTestButton, 'red') ; 
			EnableRecordTSIFTable() ;	
		
	}else{
		EnableRadios() ;
		DisableButton(gui_front.ResetCountersButton) ; 
		DisableButton(gui_front.StopDSPButton) ; 
		EnableButton(gui_front.StartTestButton,'green');	
		DisableButton(gui_front.StopTestButton) ; 
		DisableRecordTSIFTable() ;	
	}
	 
	 
	/// Power Up /Down Buttons
	 if (curr_state_num >= 1) 
	{
		EnableButton( gui_front.PowerDownButton, 'red' );
		DisableButton(gui_front.PowerUpButton); 
	}else {
		DisableButton(gui_front.PowerDownButton);
		EnableButton(gui_front.PowerUpButton, 'green') ; 
	}
	


///  Acquisition Buttons
	if (curr_state_num == 1) 
	{
		EnableButton(gui_front.AcquireButton, 'green') ; 
	}else{
		DisableButton(gui_front.AcquireButton);
	}
	
	 
	 
	if (curr_state_num == TRAFFIC_STATE ) 
	{
		if (testZeroPayloadIsRunning == true) 
		{
			  DisableZeroPayloadTable() ; 
			  gui_front.ZeroPayloadTestResultTable.disabled= false ;
		}else{
				EnableZeroPayloadTable() ; 
	           gui_front.ZeroPayloadTestResultTable.disabled= true ;
		}

            //  gui_front.no_signal_timer.disabled = true; 
			 // gui_front.no_signal_timer_t.disabled = true; 	

	}else{
			DisableZeroPayloadTable() ;
			gui_front.ZeroPayloadTestResultTable.disabled= true ; 	
			//gui_front.no_signal_timer.disabled   = false; 
			//gui_front.no_signal_timer_t.disabled = false; 	
			
	}
  
  if (testZeroPayloadIsRunning == true)  
  {
	DisableButton(gui_front.PowerDownButton) ; 
	DisableButton(gui_front.PowerUpButton) ; 
	DisableButton(gui_front.AcquireButton) ;
	DisableButton(gui_front.StopDSPButton) ;
	DisableRadios() ; 
  }

		break ; 
	}// close case PHY
 } // close case switch

}// close function RefreshGUI()
///////////////////////////////////////////////////////////////
function UpdateVersionTable()
{ 
	
	if ( IsReceivedHWVersion == false )
	{
		if (RawDataContainer.RF_chip_type != undefined) 
		{
			gui_front.RFChipType.innerText  = RawDataContainer.RF_chip_type ; 
			gui_front.BBChipType.innerText  = RawDataContainer.BB_chip_type ; 
			gui_front.GamlaChipType.innerText  = RawDataContainer.Gamla_type ; 
			IsReceivedHWVersion = true ; 
		}else{
			gui_front.RFChipType.innerText  = "---" ; 
			gui_front.BBChipType.innerText  = "---" ;  ; 
			gui_front.GamlaChipType.innerText  = "---" ; 
			ask_For_L1_AcqStatus();  
		}
	}
}
/////////////////////////////////////////////////////////
function EnableZeroPayloadTable() 
{  
	gui_front.ZeroPayloadTestSetupTable.disabled= false ;
	gui_front.ZeroPayloadTestResultTable.disabled= false ;
	EnableButton( gui_front.StartZeroPayloadTestButton , 'navy'); 
} 

function DisableZeroPayloadTable() 
{
	gui_front.ZeroPayloadTestResultTable.disabled = true ;
	gui_front.ZeroPayloadTestSetupTable.disabled  = true ;
	DisableButton( gui_front.StartZeroPayloadTestButton); 
}  
/////////////////////////////////////////////////////////
function ProcessUnsupportedSubpacket( Item, Offset )
{
   /* Do Nothing */
 
}
/////////////////////////////////////////////////////////
function ProcessPowerupDone( Item )
{

	curr_state_num= 1;
	UpdateStateMachineDisplay();
	RefreshGUI() ;
	 
	if( isTestPhy()  &&   phy_test_is_running == true &&  gui_did_powerup == false ) 
	{	
		L1_acquire();
	    gui_did_powerup = true ;  // to avoid the cases where in the middle of phy test , the L3 is doing the power up
	}
	

	if (isTestScan())
	{
		ChannelNum = getStartChannelByRegion() ; 
		var freq = GetFreqFromChannelNumber(ChannelNum) ; ;
		if (freq == 0)	{	return ;	}

		L1_acquire( freq );
	}
	

}// close function function ProcessPowerupDone

/////////////////////////////////////////////////////////////////////////////////////
function ProcessPowerdownDone( Item )
{ 
	clearInterval( check_FPS_interval_ID );
	curr_state_num=0;
	UpdateStateMachineDisplay();
	RefreshGUI() ;
	
	if ( (isTestScan() && phy_test_is_running && gui_did_powerup == false  )|| ( isTestPhy()&& phy_test_is_running)  )
	{
		L1_powerup();
	}
	
	
}
/////////////////////////////////////////////////////////////////////////////////////
function ProcessL1StateChangeEvent( Item )
{
   var Fields = Item.GetItemFields();
   if (Fields == null) {return ;   }

   var curr_state_str = Fields.GetFieldValueText( 0 );
   curr_state_num = Fields.GetFieldValue( 0 );
   var previous_state = Fields.GetFieldValueText( 1 );

HandleStateNotification();

}
/////////////////////////////////////////////////////////////////////////////////////






///////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////
function ProcessAcqDoneStatusEvent( Item )
{
  getRawDataFromEvent(  Item , "ACQ_DONE_STATUS"  ) ; 
  
 // if (RawDataContainer.Acq_status == "FAIL") {  RawDataContainer.status_rssi = undefined ;} 

   IsReceivedHWVersion = false ;
  UpdateAcquisitionTable();
   
  UpdateVersionTable() ; 
 
  if( isTestScan() )
  { 
			UpdateValidScannedFreqs()	;
			L1_StopDSP();
				
				Sleep(3000) ; // todo - in general all the code below should be in function something like resetDSP_done
						
			if (ChannelNum < end_chan )
			{
				ChannelNum++ ; 
				var freq   = GetFreqFromChannelNumber(  ChannelNum  );
				if (freq == 0)	{	return ;	}
				L1_acquire(freq);
			}
			else
			{
					ScanComplete();
				    L1_powerdown();
			}
  }// scan case 
   
}//close function
/////////////////////////////////////////////////////////////////////////////////////

function UpdateValidScannedFreqs()
{
	
	if (RawDataContainer.Acq_status	 == "SUCCESS")
	{

		//ValidFrequencies[ValidFrequencies.length] = (RawDataContainer.frequency_div10 * 10) + 7; // Add 7 MHz for exact frequency
		ValidFrequencies[ValidFrequencies.length] = ((Math.floor(RawDataContainer.frequency_div10 /1e05)  + 1/7)*1e6).toFixed(0);
		ValidChannelNum[ValidChannelNum.length] = ChannelNum ; 
	}
}
/////////////////////////////////////////////////////////////////////////////////////
function ProcessQtvApiCommandResponse( Item )
{

	var Fields = Item.GetItemFields();
	if (Fields == null) {return ;   }

	var api_cmd = Fields.GetFieldValue( 1 );

	for( var i=0; i<qtv_api_response_handlers.length; i++ )
	{
		if( api_cmd == qtv_api_response_handlers[i].api_cmd && 	qtv_api_response_handlers[i].process_function )
		{
			qtv_api_response_handlers[i].process_function( Item );
				break ;
		}//close if
	}// close for loop
}// close function
/////////////////////////////////////////////////////////////////////////////////////
function QTV_Framework_Start( )
{
  var cmd_str = "";

  cmd_str += qtv_sequence_number++;
  cmd_str += " 0";  // is replay

  SendRequest( QTV_START_FRAMEWORK, cmd_str );  
}
/////////////////////////////////////////////////////////////////////////////////////
function ProcessQtvFrameworkStartResponse( Item )
{
 if (video_test_is_running) {
  Sleep(2000); 
  QTV_Framework_Init();
  }
}
/////////////////////////////////////////////////////////////////////////////////////
function QTV_Framework_Init( )
{
  var cmd_str = "";

  cmd_str += qtv_sequence_number++; // sequence number (uint32)
  cmd_str += " 0";                  // fragment type (uint8)
  cmd_str += " 10";                 // payload length (uint16)
  cmd_str += " 0";                  // reserved (uint16)
  cmd_str += " 0";                  // time_delta (uint32)
  cmd_str += " 1";                  // API ID (uint16)
  cmd_str += " 4";                  // Parameters size (uint16)
  cmd_str += " 0";                  // priority (uint32) 

  SendRequest( QTV_FRAMEWORK_CMD, cmd_str );
}
/////////////////////////////////////////////////////////////////////////////////////
function ProcessQtvFrameworkInitResponse( Item )
{
  if (video_test_is_running) {
  var Fields = Item.GetItemFields();
  if (Fields == null) {return ;   }

  qtv_handle = Fields.GetFieldValue( 4 );
   Sleep(2000); 
  QTV_Register_CB();
  }
}
/////////////////////////////////////////////////////////////////////////////////////
function QTV_Register_CB( )
{ 
  var cmd_str = "";

  cmd_str += qtv_sequence_number++; // sequence number (uint32)
  cmd_str += " 0";                  // fragment type (uint8)
  cmd_str += " 6";                  // payload length (uint16)
  cmd_str += " 0";                  // reserved (uint16)
  cmd_str += " 0";                  // time_delta (uint32)
  cmd_str += " 2";                  // API ID (uint16)

  SendRequest( QTV_FRAMEWORK_CMD, cmd_str );
}
///////////////////////////////////////////////////////////////////
function ProcessQtvRegisterCbResponse( Item )
{ 
	if (video_test_is_running)
	{
		QTV_cb_registered = true;
		EFS2_active = true ; 
		 Sleep(2000); 
		EFS2_Delete_File( efs2_filename);
	}
}
///////////////////////////////////////////////////////////////////
function QTV_Open_URL( filename )
{
  var filename_str = filename;

  var str_len = filename_str.length + 1;
  var payload_len = ( str_len );
  var cmd_len = payload_len + 10;

  var cmd_str = "";

  cmd_str += qtv_sequence_number++; // sequence number (uint32)
  cmd_str += " 0";                  // fragment type (uint8)
  cmd_str += " " + cmd_len;         // payload length (uint16)
  cmd_str += " 0";                  // reserved (uint16)
  cmd_str += " 0";                  // time_delta (uint32)
  cmd_str += " 3";                  // API ID (uint16) - Open URN
  cmd_str += " " + payload_len;     // Parameters size (uint16)
  cmd_str += " " + filename_str;    // Video URN
 
  SendRequest( QTV_FRAMEWORK_CMD, cmd_str );
}
///////////////////////////////////////////////////////////////////

function ProcessQtvOpenUrlResponse( Item )
{ 
  /* Do nothing, wait for PMT table acquisition before starting playback */

  //QTV_Stop_Playback();
  
}
///////////////////////////////////////////////////////////////////
function QTV_Play( )
{
  var cmd_str = "";

  cmd_str += qtv_sequence_number++; // sequence number (uint32)
  cmd_str += " 0";                  // fragment type (uint8)
  cmd_str += " 16";                 // payload length (uint16)
  cmd_str += " 0";                  // reserved (uint16)
  cmd_str += " 0";                  // time_delta (uint32)
  cmd_str += " 7";                  // API ID (uint16) - Play
  cmd_str += " 8";                 // Parameters size (uint16)
  cmd_str += " 0";                  // Start position
  cmd_str += " -1";                 // End Position

   SendRequest( QTV_FRAMEWORK_CMD, cmd_str );
}
/////////////////////////////////////////////////////////////////////////////////////

function ProcessQtvPlayClipResponse( Item )
{
  /* Do nothing */
 
}
/////////////////////////////////////////////////////////////////////////////////////
function QTV_Stop_Playback( )
{
  var cmd_str = "";

  cmd_str += qtv_sequence_number++; // sequence number (uint32)
  cmd_str += " 0";                  // fragment type (uint8)
  cmd_str += " 6";                  // payload length (uint16)
  cmd_str += " 0";                  // reserved (uint16)
  cmd_str += " 0";                  // time_delta (uint32)
  cmd_str += " 10";                  // API ID (uint16)

  SendRequest( QTV_FRAMEWORK_CMD, cmd_str );
}
/////////////////////////////////////////////////////////////////////////////////////
function ProcessQtvStopPlaybackResponse( Item )
{
  if( isTestVideo() )
  {
    /* Clear the phone's screen by sending # and END */
    SendHashKeyPress();
    SendEndKeyPress();
  }
}
/////////////////////////////////////////////////////////////////////////////////////
function QTV_Framework_Stop( )
{
 
  var cmd_str = "";

  cmd_str += qtv_sequence_number++;

  SendRequest( QTV_STOP_FRAMEWORK, cmd_str );
	
}
/////////////////////////////////////////////////////////////////////////////////////
function ProcessQtvFrameworkStopResponse( Item )
{
  QTV_cb_registered = false;
}

/////////////////////////////////////////////////////////////////////////////////////
function stopVideoPlayback()
{
   video_test_is_running = false; 
   QTV_Stop_Url() ;
   QTV_Framework_Stop();
   
   L1_StopDSP() ; 
   L1_powerdown() ;
   RefreshGUI() ;   
}
///////////////////////////////////////////////////////////////////////////////////////
function QTV_Stop_Url()
{
  QTV_Stop_Playback();  
}



///////////////////////////////////////////////////////////////////////////////////////////////
function ProcessVersionsResponse(Item)
{
	getRawDataFromVersionResponse(Item);
	populateVersionData();

}
///////////////////////////////////////////////////////////////////////////////////////////////
function populateVersionData()
{

	if (curr_state_num >= 1)  // means there is a versions response and the chip is power up
	{
		IsReceivedFWversion= true; 
	}
	
	if (curr_state_num >= 2)  // means there is a versions response and the chip is power up
	{
		IsReceivedHWVersion = true; 
	}
	
   gui_front.tech.innerText         = selectedTechnology ;    
	gui_front.sw_version.innerText  = "" + RawDataContainer.sw_build.toString(16) +"."+ RawDataContainer.sw_release.toString(16) + "."+ RawDataContainer.sw_ver.toString(16) ;   

	if (IsReceivedFWversion== true  ) 
	{
		gui_front.fw_version.innerText   = "" + RawDataContainer.fw_ver.toString(16) + "." + RawDataContainer.fw_sub_version.toString(16); 
	}
	else{
    	gui_front.fw_version.innerText   = "---" ;
	}	
}
////////////////////////////////
function ProcessStateResponse(Item)
{
		var Fields = Item.GetItemFields();
		if (Fields == null) {return ;   }
		
		curr_state_num = Fields.GetFieldValue( 2 );
		
		HandleStateNotification();
		
		
}// close function ProcessStateResponse
/////////////////////////////////////////////////////////////
function HandleStateNotification()
		{
	
		if (curr_state_num >=TRAFFIC_STATE) 
		{
			RawDataContainer.Acq_status = "SUCCESS";
		}else{
			RawDataContainer.Acq_status = "FAIL";
		}
		
		
	if (curr_state_num >= 3) 
	{
		if (IsReceivedHWVersion == false && !Gui_perform_acquisition)
		{
			ask_For_L1_AcqStatus();  
		}
	}
		
	if (curr_state_num >= 1) 
	{

		if (IsReceivedFWversion == false) 
		{
			ask_For_L1_Versions();
		}
	}
	
	if (curr_state_num <  TRAFFIC_STATE) 
	{
	    test_record_in_active =false ; 
		DisableButton(gui_front.StartRecordTSIFPacketsButton);
	    
	}else{
		if (test_record_in_active == false) 
		{
			EnableRecordTSIFTable() ; 
			
		}else{
			DisableRecordTSIFTable() ;	
		}
	
	}
	
	
	UpdateStateMachineDisplay();
	RefreshGUI();
	}

/////////////////////////////////////////////////////////
function EnableRecordTSIFTable() 
{ 
	gui_front.RecordTSIFPacketsTable.disabled = false ; 
	EnableButton(gui_front.StartRecordTSIFPacketsButton,'navy');
}

function DisableRecordTSIFTable() 
{
	 
	gui_front.RecordTSIFPacketsTable.disabled = true ; 
	DisableButton(gui_front.StartRecordTSIFPacketsButton);
}

function ProcessEfs2UnlinkResponse( Item )
{

	if (EFS2_active && video_test_is_running)
	{
		EFS2_Open_URL_File( );
	}
}
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function EFS2_Open_URL_File( )
{
  EFS2_Open_File(efs2_filename, "O_CREAT", 0) ; 
  
 
 /* var cmd_str = "";

  var flags = 577; // O_CREAT
  var mode  = 0;    // read / write / execute

  cmd_str += flags + " ";  // File flags
  cmd_str += mode  + " "; // mode
  cmd_str += efs2_filename;

  SendRequest( EFS2_DIAG_OPEN, cmd_str ); 
  */
}
/*
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function EFS2_Create_New_URL_File( filename, contents, complete_function, args )
{
  efs2_filename               = filename;
  efs2_file_contents          = contents;
  efs2_complete_function      = complete_function;
  efs2_complete_function_args = args;

  EFS2_Delete_URL_File();
}

*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ProcessEfs2OpenResponse( Item )
{ 
	var Fields = Item.GetItemFields();
	if (Fields == null) {return ;   }
    
    var fd = Fields.GetFieldValue(0);
	
	if (checkingQTV_CFG_File) 
	{
		if (fd == -1 ) {
			alert("Error, couldent find the file: qtv_config.cfg in folder : /mod/mediaplayer ");
			return ; 
		}else{
			checkingQTV_CFG_File = false; 
			qtv_sequence_number = 1; 
			QTV_Framework_Start();   
		}
	}
	
	if (EFS2_active && video_test_is_running)
	{
		efs2_fd = fd ; 
		EFS2_Write_to_File(efs2_fd, 0, efs2_file_contents) ;
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function ProcessEfs2WriteResponse( Item )
{ 
	if (EFS2_active && video_test_is_running)
	{
		EFS2_Close_File(efs2_fd );
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
function EFS2_Close_File( )
{
  var cmd_str = "";

  cmd_str += efs2_fd;

  SendRequest( EFS2_DIAG_CLOSE, cmd_str );
}
*/
//////////////////////////////////////////////////////////////////////////
function ProcessEfs2CloseResponse( Item )
{
 
	if (EFS2_active && video_test_is_running)
	{
		EFS2_active = false;
		QTV_Open_URL( efs2_filename );
	}
/*
  if( efs2_complete_function )
  {
    efs2_complete_function( efs2_complete_function_args );
  }
*/
}

//////////////////////////////////////////////////////////////////////////
function SendHashKeyPress( )
{
  var cmd_str = "0 35";

  SendRequest( KEYPRESS, cmd_str );
}
//////////////////////////////////////////////////////////////////////////
function SendEndKeyPress( )
{
  var cmd_str = "0 81";

  SendRequest( KEYPRESS, cmd_str );
}
//////////////////////////////////////////////////////////////////////////

///   send_data 75 44 241 0 12 10 1 0 0 0   // enable disable resampler
//   send_data 75 44 241 0 12 10 0 0 0 0
//dafi
function onclickStartZeroPayloadTest()
{
 onclickResetCounters();
  testZeroPayloadIsRunning = true ; 
 
  IQXDM2.RequestItem( DTV_L1_CMD, "109 " + gui_front.OneBitNumPkt.value + " "+ OneBitThreshold + " " +gui_front.OneBitPID.value ,true, TIMEOUT_MS, 1,1);	  

  IQXDM2.RequestItem( DTV_L1_CMD, "110",true, TIMEOUT_MS, 2, 1000 );  //start the polling on the status
 RefreshGUI();
}


function onclickStartRecordTSIFPackets( )
{
   gui_front.curr_num_tsif_pkt.innerText = "---";
   user_request_record_tsif = true ;
   EFS2_Open_Dir("mmc1"); 
   
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function PopulateAvailableFrequency()
  {
  gui_front.ChannelNumberSelect.innerHTML = "";

   if( FreqSetupType == BY_REGION_FREQS )
   {
			//ChannelSelectRegion[Region].checked = true;

			var  freqHz, freq_mhz;

			for( var i=start_chan; i <= end_chan; i++ )
			{
				// Skip Brazil channel 37 
				if( ! (Region == 0 && i == 37 ) )
				{
				 var new_chan = document.createElement("OPTION");
				freqHz = GetFreqFromChannelNumber(  i  );
			    if (freqHz == 0)	{	return ;	}
				freq_mhz = freqHz / 1e06;
		  
				new_chan.text =   i  + " (" + freq_mhz.toFixed(6) + " MHz )";
				new_chan.value =  i ;
				gui_front.ChannelNumberSelect.add(new_chan);
				}
			}

			//gui_front.ChannelNumberSelect[0].selected = true;
   }
   else if( FreqSetupType == SCANED_FREQS && ValidFrequencies.length )
   {
		for( var i=0; i<ValidFrequencies.length; i++ )
		{
			var new_chan = document.createElement("OPTION");

			var freq_mhz = ValidFrequencies[i] / 1e06;

			new_chan.text = ValidChannelNum[i]  + " (" + freq_mhz + " MHz )";
			new_chan.value = ValidChannelNum[i];

			gui_front.ChannelNumberSelect.add(new_chan);
			
		}
   }
}// close function 
////////////////////////////////////////////////////////////////
function UpdateStateMachineDisplay()
{
	var BgColor = "" ; 
	var TxtColor = "" ; 
	var StateName ="" ; 
	
	if (userType == "Advanced") 
	{
	
	StateName = StatesNamesEnum[curr_state_num];
	
	switch(curr_state_num)
	{
	case 100 :
	case 101 :
	case 102 : 
			BgColor ='red' ;
			TxtColor ='white' ; 
			break ; 
	case 0: 
		BgColor ='red' ;
		TxtColor ='white' ; 
		break ; 
	
	case 1: 
		BgColor = 'blue' ;
		TxtColor ='white' ;  
		break ; 
	
	case 2: 
	case 3: 
		BgColor = 'yellow' ;
		TxtColor ='black' ; 
		break ; 
	
	case 4: 
		BgColor = 'green' ; 
		TxtColor ='white' ; 
	break ; 
	
	case 5: 
	case 6: 
	case 7: 
	case 8: 
	case 9: 
	case 10: 
	case 11: 
		BgColor =  'orange' ;
		TxtColor ='black' ; 
	break ; 
	
	
	
	}// close switch 
	
	}
	if (userType == "Customer") 
	{
			
			switch(curr_state_num)
			{
			case -1 : 
			    BgColor ='red' ;
				TxtColor ='white' ; 
				StateName = "DISCONNECTED";
			    break ; 
			case 0: 
			case 1: 
				BgColor ='red' ;
				TxtColor ='white' ; 
				StateName = "IDLE";
				break ; 
			
			case 2: 
			case 3: 
			case 5: 
			case 7: 
			case 8: 
			case 9: 
			case 10: 
				BgColor = 'yellow' ;
				TxtColor ='black' ;
				StateName = "ACQUISTION"; 
				break ; 
			
			
			
			case 4: 
			case 6: 
			case 11: 
				BgColor = 'green' ; 
				TxtColor ='white' ; 
				StateName = "TRAFFIC"; 
			break ; 
			
			}// close switch 
	}
	
	
	gui_front.l1_state_txt_.innerText = StateName;
	gui_front.l1_state_txt_.style.color = TxtColor;
	gui_front.l1_state_txt_.style.backgroundColor = BgColor;
}
/////////////////////////////////////////////////////////////////




function CheckFrameRenderRate()
{

gui_front.QTV_fps.innerText = cnt_fps/2;

	if (Math.abs(cnt_fps - desired_fps*2)  > 0.1 * desired_fps*2 ) 
	{
		gui_front.QTV_fps.style.backgroundColor = 'red';
		//setTimeout( "beep(gui_front.sound1)", 1 );// this call is used in order create new thread and to avoid the delay of beep function
		

	}else{
		gui_front.QTV_fps.style.backgroundColor = 'white';
	}
cnt_fps= 0 ; 
}


////////////////////////////////////////////////////////////////////////////////////////////////
function  Process_L3_event_activate ()
 {
  gui_front.l3_state.innerText  = "ACTIVATE" ;
  gui_front.l3_state.style.backgroundColor = 'blue';
    gui_front.l3_state.style.color = 'white';
   }
   ////////////////////////////////////////////////////////////////////////////////////////////////
 function Process_L3_event_de_activate () 
 { 
 gui_front.l3_state.innerText  = "DE-ACTIVATE" ;
 gui_front.l3_state.style.backgroundColor = 'red';
  gui_front.l3_state.style.color = 'white';
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////
function Process_L3_event_tune () 
{ 
gui_front.l3_state.innerText  = "TUNE" ; 
gui_front.l3_state.style.backgroundColor =  'yellow' ;
      gui_front.l3_state.style.color = 'black'; 
}
////////////////////////////////////////////////////////////////////////////////////////////////
 function Process_L3_event_un_tune() 
 {
  gui_front.l3_state.innerText  = "UN-TUNE" ; 
  gui_front.l3_state.style.backgroundColor =  'yellow' ; 
  gui_front.l3_state.style.color = 'white';
  } 
  ////////////////////////////////////////////////////////////////////////////////////////////////
 function Process_L3_event_select_service() 
 {
  gui_front.l3_state.innerText  = "Select Service" ; 
   gui_front.l3_state.style.backgroundColor =  'green' ; 
    gui_front.l3_state.style.color = 'white';
  } 
  ////////////////////////////////////////////////////////////////////////////////////////////////
function Process_L3_event_service_available() 
{
 gui_front.l3_state.innerText  = "Service Available" ; 
   gui_front.l3_state.style.backgroundColor =  'green' ; 
   gui_front.l3_state.style.color = 'white';
 } 
 ////////////////////////////////////////////////////////////////////////////////////////////////
function Process_L3_event_traffic_lost() 
{
 gui_front.l3_state.innerText  = "Traffic Lost" ; 
    gui_front.l3_state.style.backgroundColor =  'orange' ; 
          gui_front.l3_state.style.color = 'black';
 } 
 ////////////////////////////////////////////////////////////////////////////////////////////////
function Process_L3_event_table_update(Item) 
{

var Fields = Item.GetItemFields();
 var table_type =  Fields.GetFieldValue( 0 ) ;
 gui_front.l3_state.innerText  = "Table Update " + table_type ; 
gui_front.l3_state.style.backgroundColor =  'cyan' ; 
gui_front.l3_state.style.color = 'black';
 } 
 ////////////////////////////////////////////////////////////////////////////////////////////////
function Process_L3_event_track_selected() 
{ 
gui_front.l3_state.innerText  = "Track Selected" ; 
   gui_front.l3_state.style.backgroundColor =  'cyan' ; 
         gui_front.l3_state.style.color = 'black';
} 
////////////////////////////////////////////////////////////////////////////////////////////////
 function Process_L3_event_pes_overflow() 
 {
  gui_front.l3_state.innerText  = "PES Overflow" ; 
     gui_front.l3_state.style.backgroundColor =  'red' ; 
      gui_front.l3_state.style.color = 'white';
  } 
  ////////////////////////////////////////////////////////////////////////////////////////////////
 function Process_L3_event_pes_underflow() { /*gui_front.l3_state.innerText  = "PES Underflow" ; */} 
function Process_L3_event_acq_data_comp() { gui_front.l3_state.innerText  = "Acq Data Component" ; } 
 function Process_L3_event_stop_comp_acq() { gui_front.l3_state.innerText  = "Stop Component Acq" ; } 
function Process_L3_event_dii_changed() { gui_front.l3_state.innerText  = "DII Changed" ; } 
 function Process_L3_event_data_msg() { gui_front.l3_state.innerText  = "Data Msg" ; } 
 function Process_L3_event_module_recons () { gui_front.l3_state.innerText  = "Module Reconstruction" ; }
 function Process_L3_event_parsing_err () { gui_front.l3_state.innerText  = "Parsing Error" ; }
 



function Process_QTV_event_clip_ended()
{
gui_front.qtv_state.innerText  = "CLIP ENDED" ;
}

 function Process_QTV_event_dsp_init()
 {
 gui_front.qtv_state.innerText  = "DSP INIT" ;
 }
 
 function Process_QTV_event_state_idle ()
 {
  gui_front.qtv_state.innerText  = "IDLE" ;
 }
function Process_QTV_event_state_conncting ()
{
  gui_front.qtv_state.innerText  = "CONNECTING" ;
}
 function Process_QTV_event_state_setting_tracks ()
 {
 gui_front.qtv_state.innerText  = "SETTING TRACKS" ;
 }
function Process_QTV_event_state_streaming ()
{
 gui_front.qtv_state.innerText  = "STREAMING" ;
  gui_front.qtv_state.style.backgroundColor =  'green' ; 
  gui_front.qtv_state.style.color = 'white';
}
function Process_QTV_event_i_frame_rendered ()
{
 gui_front.qtv_state.innerText  = "1st I Frame" ;
}
function Process_QTV_event_state_init_stream_fail ()
{
 gui_front.qtv_state.innerText  = "STREAMER FAIL" ;
}  
function Process_QTV_event_buffering_started ()
{
 gui_front.qtv_state.innerText  = "BUFFERING STARTED" ;
}
 function Process_QTV_event_buffering_ended ()
 {
  gui_front.qtv_state.innerText  = "BUFFERING ENDED" ;
 
 }
function Process_QTV_event_state_streamer_connected ()
{
 gui_front.qtv_state.innerText  = "CONNECTED" ;
  gui_front.qtv_state.style.backgroundColor =  'green' ; 
  gui_front.qtv_state.style.color = 'white';
}

function  ShowAJDMode()
{

if (str2num(gui_front.analog_JD_mode.innerText) != RawDataContainer.analog_JD_mode  )
	{
	gui_front.analog_JD_mode.innerText = RawDataContainer.analog_JD_mode ; 
	beep(gui_front.sound1);
	}
	
	if (RawDataContainer.analog_JD_mode  == 1) 
	{
	gui_front.analog_JD_mode.style.backgroundColor = 'white'; 
	}else{
	gui_front.analog_JD_mode.style.backgroundColor = 'red'; 
	}

}    
	

function processQTV_PCR_Drift_Rate(){}


function ProcessEfs2OpenDirResponse(Item)
{

if (user_request_record_tsif) 
{
  var Fields = Item.GetItemFields();
  var dir_ptr =  Fields.GetFieldValue( 0 ) ;
  var erroNo =  Fields.GetFieldValue( 1 ) ;

	if (erroNo != 0 )
	{
		alert("You asked Record TSIF !  First You need to insert micro-SD card into its slot");
		user_request_record_tsif = false ; 
		return ; 
	}else{
		EFS2_Make_Dir(".\/mmc1\/DTV");
	}

}// close the state user_request_record_tsif



}// close function ProcessEfs2OpenDirResponse

function ProcessEfs2CreateDirResponse(Item)
{
if (user_request_record_tsif) 
{
	var Fields =  Item.GetItemFields();
	var erroNo =  Fields.GetFieldValue( 0 ) ;

	if (erroNo != 0 && erroNo != 6 )
	{
		alert("Couldn't create a folder for the recording... Try Againg or replace the SD Card ");
		user_request_record_tsif = false ; 
		return ; 
	}else{
		user_request_record_tsif = false ; 
		test_record_in_active = true ; 
		DisableButton(gui_front.StartRecordTSIFPacketsButton) ; 
		StartRecordTSIFPackets(Math.ceil(gui_front.numOfTISFPackets.value/18)); 
	}


}
}// close function ProcessEfs2CreateDirResponse