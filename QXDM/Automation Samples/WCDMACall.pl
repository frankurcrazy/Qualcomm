# NOTE: This must be run from Perl command box,
# i.e.  Perl WCDMACall.pl <Port Number> <Phone Number>

# This example demonstrates monitoring multiple types
# of events during the lifetime of a WCDMA call

use HelperFunctions;

# Global variables
my $QXDM;
my $QXDM2;
my $ReqHandle = 0xFFFFFFFF;;

# COM port to be used for communication with the phone by QXDM
my $PortNumber = "";
my $PhoneNumber = "";

# Process the arguments - port number
sub ParseArguments
{
   # Assume failure
   my $RC = false;
   my $Help = "Syntax: Perl WCDMACall.pl <COM Port Number> <Phone Number>\n"
            . "Eg:     Perl WCDMACall.pl 5 0123456789\n";

   if ($#ARGV < 0)
   {
      print "\n$Help\n";
      return $$RC;
   }

   $PortNumber = $ARGV[0];
   if ($PortNumber < 0 || $PortNumber > 100)
   {
      print "\nInvalid port number\n";
      print "\n$Help\n";
      return $RC;
   }

   # Extract phone number (only digits)  
   $PhoneNumber = $ARGV[1];
   if (length( $PhoneNumber ) < 1)
   {
      print "\nInvalid phone number\n";
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
         # Register for events:
         #    416  - EVENT_CM_CALL_STATE
         #    629  - EVENT_CM_CALL_EVENT_ORIG
         #    630  - EVENT_CM_CALL_EVENT_CONNECT
         #    631  - EVENT_CM_CALL_EVENT_END
         $clientObject->AddEvent( 416 );
         $clientObject->AddEvent( 629 );
         $clientObject->AddEvent( 630 );
         $clientObject->AddEvent( 631 );
         $clientObject->CommitConfig();

         $Txt = "Registered for CM events";
         print "\n$Txt";

         # Success!
         $RC = true;
      }
      else
      {
         $Txt = "Failed to get client interface";
         print "\n$Txt";
      }
   }
   else
   {
      $Txt = "Unable to register as QXDM client";
      print "\n$Txt";
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

# Originate a WCDMA call
sub OriginateWCDMACall
{
   # Assume failure
   my $RC = false;
   my $Txt = "";

   my $Cmd = "WCDMA/Call Originate Request";
   my $Args = length( $PhoneNumber ) . " " . $PhoneNumber . " 7";

   my $Rsp = SendRequestAndReturnResponse( $Cmd, $Args, 18 );
   if ($Rsp != null)
   {
      $RC = true;
   }

   return $RC;
}

# Terminate a WCDMA call
sub TerminateWCDMACall
{
   # Assume failure
   my $RC = false;
   my $Txt = "";

   my $Cmd = "WCDMA/Call End Request";
   my $Args = "";

   my $Rsp = SendRequestAndReturnResponse( $Cmd, $Args, 18 );
   if ($Rsp != null)
   {
      $RC = true;
   }

   return $RC; 
}

# Process client attempting to find an exit condition
sub ProcessClient
{
   my $bExit = false;
   my $bCall = false;

   my $CurrIndex = -1;
   my $PrevIndex = -1;
   my $Txt = "";

   # We monitor the call status for up to sixty seconds but we
   # only allow thirty seconds for call setup and after fifty
   # seconds we automatically terminate the call
   for (my $secs = 0; $secs < 60; $secs++)
   {
      # Sleep for 1s
      sleep( 1 );

      # Get index of last item in client
      $CurrIndex = $QXDM2->GetClientItemCount( $ReqHandle ) - 1;
      if ($PrevIndex > $CurrIndex)
      {
         # Reset index if it is greater than item count
         $PrevIndex = -1;
      }

      # Make sure there is an item
      if ($CurrIndex < 0) 
      {
         next;
      }      

      # Process all new items
      for (my $i = $PrevIndex + 1; $i <= $CurrIndex; $i++)
      {
         my $Item = $QXDM2->GetClientItem( $ReqHandle, $i );
         if ($Item != null)
         {
            DumpItemDetails( $Item, 18 );

            my $ItemKey = $Item->GetItemKeyText();
            if ($ItemKey eq "[00630]")
            {
               # EVENT_CM_CALL_EVENT_CONNECT
               # A call is up
               $bCall = true;
            }
            elsif ($ItemKey eq "[00631]")
            {
               # EVENT_CM_CALL_EVENT_END   
               # A call has been ended, time to exit
               $bExit = true;
            }
         }
      }

      # Get ready for next pass
      $PrevIndex = $CurrIndex;

      # Did we manage to make a call?
      if ($secs == 30 && $bCall == false)
      {
         # It hasn't happened by now so exit
         $bExit = true;
      }

      if ($secs == 50)
      {
         # After 50s terminate the call on our own
         TerminateWCDMACall();
      }

      if ($bExit == true)
      {
         break;
      }
   }
}

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

   # Start a WCDMA call
   OriginateWCDMACall();

   # Wait for the call to terminate
   ProcessClient();

   # Clean-up
   Disconnect();
   UnregisterClient();
}

Execute();