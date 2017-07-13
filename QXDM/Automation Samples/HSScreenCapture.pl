# NOTE: This must be run from Perl in a command box,
# i.e.  Perl HSScreenCapture.pl <Port Number>

# This example demonstrates capturing the handset screen
# to a bitmap file by using QXDM and QPST automation

use HelperFunctions;

# Global variables
my $QXDM;
my $QXDM2;
my $ReqHandle = 0xFFFFFFFF;

# COM port to be used for communication with the phone by QXDM
my $PortNumber = "";

# Process the arguments - port number
sub ParseArguments
{
   # Assume failure
   my $RC = false;
   my $Txt = "";
   my $Help = "Syntax: Perl HSScreenCapture.pl <COM Port Number>\n"
            . "Eg:     Perl HSScreenCapture.pl 5\n";

   if ($#ARGV < 0)
   {
      print "\n$Help\n";
      return $RC;
   }

   $PortNumber = $ARGV[0];
   if ($PortNumber < 0 || $PortNumber > 100)
   {
      print "\nInvalid port number\n";
      print "\n$Help\n";
      return $RC;
   }

   $RC = true;
   return $RC;
}

# Initialize application
sub Initialize
{
   # Assume failure
   my $RC = false;

   # Create QXDM object
   $QXDM = new Win32::OLE 'QXDM.Application';
   if ($QXDM == null)
   {
      print "\nError launching QXDM";

      return $RC;
   }

   # Create QXDM2 interface
   $QXDM2 = $QXDM->GetIQXDM2();
   if ($QXDM2 == null)
   {
      print "\nQXDM does not support required interface";

      return $RC;
   }

   SetQXDM ( $QXDM );
   SetQXDM2 ( $QXDM2 );

   # Success
   $RC = true;
   return $RC;
}

# Register the QXDM client
sub RegisterClient
{
   # Assume failure
   my $RC = false;
   my $Txt = "";

   # Create a client
   $ReqHandle = $QXDM2->RegisterQueueClient( 256 );
   if ($ReqHandle != 0xFFFFFFFF)
   {
      $Txt = "Registered as QXDM client";
      print "$Txt";

      # Get a configuration object
      my $clientObject = $QXDM2->ConfigureClientByKeys( $ReqHandle );
      if ($clientObject != null)
      {
         # Register for subsystem dispatch response (delayed only):
         #   "Handset/Display Capture Immediate/Delayed Response"
         $clientObject->AddSubsysResponse( 16, 2 );
         $clientObject->SetSubsysV2DelayedResponsesOnly( true );
         $clientObject->CommitConfig();

         $Txt = "Registered for Handset/Display Capture Delayed Response";
         print "\n$Txt\n";

         # Success!
         $RC = true;
      }
      else
      {
         $Txt = "Failed to get client interface";
         print "\n$Txt\n";
      }
   }
   else
   {
      $Txt = "Unable to register as QXDM client";
      print "\n$Txt\n";
   }

   return $RC; 
}

# Unregister the QXDM client
sub UnregisterClient
{
   # Assume failure
   my $RC = false;

   if ($ReqHandle != 0xFFFFFFFF)
   {
      $QXDM2->UnregisterClient( $ReqHandle );
      $RC = true;
   }

   return $RC;
}

# Ask the display to capture to a file, then download the file from
# the target using QPST
sub SaveDisplay
{
   my ( $DisplayID, $H, $W, $FileName ) = @_;
   # Assume failure
   my $RC = false;
   my $Txt = "";

   # Make sure the client is clear
   my $Cleared = $QXDM2->ClearClientItems( $ReqHandle );
   if ($Cleared == false)
   {
      $Txt = "Unable to clear client";
      print "\n$Txt\n";
      return $RC; 
   }

   # Send the request, wait for the immediate response
   my $Name = "Handset/Display Capture Delayed Request";
   my $Args = $DisplayID . " 0 0 " . $H . " " . $W . " HS.bmp";
   my $Item = SendRequestAndReturnResponse( $Name, $Args, 18 );
   if ($Item == null)
   {
      return $RC;
   }

   my $Secs;
   my $Items;

   # Wait for the delayed response
   for ($Secs = 0; $Secs < 5; $Secs++)
   {
      # Sleep for 1s
      sleep( 1 );

      # How many items do we have?
      $Items = $QXDM2->GetClientItemCount( $ReqHandle );
      if ($Items > 0)
      {
         break;
      }
   }

   if ($Items == 0)
   {
      $Txt = "No Handset/Display Get Parameters Delayed Response received";
      print "\n$Txt\n";
      return $RC;
   }

   $Item = $QXDM2->GetClientItem( $ReqHandle, 0 );
   if ($Item == null)
   {
      $Txt = "Unable to access Handset/Display Get Parameters Delayed Response";
      print "\n$Txt\n";
      return $RC;
   }

   DumpItemDetails( $Item, 18 );

   # Parse out the status (UINT32, 32 bits, from bit offset [header] 32)
   my $Status = GetSubsysV2ErrorCode( $Item );
   if ($Status != 0)
   {
      $Txt = "Handset subsystem error returned: " . Status;
      print "\n$Txt\n";
      return $RC;
   }

   # The screen capture file is now in EFS, to get it from EFS to the
   # PC we make use of QPST automation 
   my $QPST = new Win32::OLE 'QPSTAtmnServer.Application';
   if ($QPST == null)
   {
      $Txt = "Error interfacting to QPST";
      print "\n$Txt\n";
      return $RC;
   }

   my $PortName = "COM" . $PortNumber;
   my $QPSTPort = $QPST->GetPort( $PortName );
   if ($QPSTPort == null)
   {
      $Txt = "Error obtaining port from QPST";
      print "\n$Txt\n";

      $QPST->Quit();
      return $RC;
   }

   my $QPSTEFS = $QPSTPort->EFS;
   if ($QPSTEFS == null)
   {
      $Txt = "QPST does not support a required interface";
      print "\n$Txt\n";

      $QPST->Quit();
      return $RC;
   }

   $QPSTEFS->CopyPhoneToPC( "HS.bmp", $FileName );

   $Txt = "Downloaded temporary screen capture file from EFS to:\n";
   $Txt .= $FileName;
   print "$Txt\n";

   $QPSTEFS->Delete( "HS.bmp" );
   
   $Txt = "Deleted temporary screen capture file from EFS";
   print "$Txt\n";

   $QPST->Quit();
   $RC = true;
   return $RC;
}

# Obtain display capture parameters and then capture the display
sub CaptureDisplay
{
   my $FileName = shift;

   # Assume failure
   my $RC = false;
   my $Txt = "";

   my $Name = "Handset/Display Get Parameters Request";
   my $Args = "0";
   my $Item = SendRequestAndReturnResponse( $Name, $Args, 18 );
   if ($Item == null)
   {
      return $RC;
   }

   # Process the response obtaining the display dimensions
   my $DisplayHeight = 0;
   my $DisplayWidth = 0;
   my $Index = 0;

   my $ItemFields = $Item->GetItemFields();
   if ($ItemFields != null)
   {
      # Should be four fields
      my $FieldCount = $ItemFields->GetFieldCount();
      if ($FieldCount >= 4)
      {
         # As seen in the Item Tester/DB Editor we want the
         # first two fields
         $DisplayHeight = $ItemFields->GetFieldValue( 0 );
         $DisplayWidth = $ItemFields->GetFieldValue( 1 );
      }
   }

   if ($DisplayHeight == 0 || $DisplayWidth == 0)
   {
      $Txt = "Unable to obtain valid display height/width";
      print "\n$Txt\n";
      return $RC;
   }

   $RC = SaveDisplay( 0, $DisplayHeight, $DisplayWidth, $FileName );
   return $RC; 
}

# Main body of script
sub Execute
{
   # Parse out arguments
   my $RC = ParseArguments();
   if ($RC == false)
   {
      return;
   }

   # Launch QXDM
   $RC = Initialize();
   if ($RC == false)
   {
      return;
   }

   # Get QXDM version
   my $Version = $QXDM->{AppVersion};
   print "\nQXDM Version: " . $Version . "\n";

   # Generate a file name for screen capture file
   my $FileName = GenerateFileName( "", ".bmp" );
   if ($FileName eq "")
   {
      return;
   }

   # Register client
   $RC = RegisterClient();
   if ($RC == false)
   {
      return;
   }

   # Connect to our desired port
   $RC = Connect( $PortNumber );
   if ($RC == false)
   {
      UnregisterClient();
      return;
   }

   # Do the screen capture
   CaptureDisplay( $FileName );

   # Cleanup
   Disconnect();
   UnregisterClient();
}

Execute();