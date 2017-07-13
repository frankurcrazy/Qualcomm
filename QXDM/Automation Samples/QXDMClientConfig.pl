# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMClientConfig.pl

# This script demostrates usage of the ClientConfig automation
# interface methods:
#    AddDIAGRequest()
#    AddDIAGResponse()
#    AddSubsysRequest()
#    AddSubsysResponse()
#    AddEvent()
#    AddLog()
#    AddMessage()
#    AddString()

use HelperFunctions;

# Global variables
my $QXDM;
my $QXDM2;

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

# Add items to the client
sub AddItems
{
   # Constants
   use constant VERSION_INFO          => 0;
   use constant EFS2_HELLO_CMD        => 19;
   use constant EFS2_HELLO_SUB_CMD    => 0;
   use constant EVENT_DROP_ID         => 256;
   use constant GEN_TEMPORAL_ANALYZER => 0x1019;
   use constant MSG_ID_AAGPS          => 24;
   use constant MSG_LVL_HIGH          => 2;
   use constant MSG_LVL_ERROR         => 3;
   use constant MSG_LVL_FATAL         => 4;
   use constant ERROR                 => 2;
   use constant AUTOMATION            => 3;
   use constant CONNECTION            => 4;

   # Get a QXDM client
   my $Handle = $QXDM2->RegisterQueueClient( 256 );
   if ($Handle == 0xFFFFFFFF)
   {
      print "\nUnable to register a client\n";

      return;
   }

   my $Client = $QXDM2->ConfigureClientByKeys( $Handle );
   if ($Client == false)
   {
      print "Unable to configure client by keys\n";

      $QXDM2->UnregisterClient( $Handle );
      return;
   }

   # Register for DIAG request/response
   $Client->AddDIAGRequest( VERSION_INFO );
   $Client->AddDIAGResponse( VERSION_INFO );

   # Register for subsystem request/response
   $Client->AddSubsysRequest( EFS2_HELLO_CMD, EFS2_HELLO_SUB_CMD );
   $Client->AddSubsysResponse( EFS2_HELLO_CMD, EFS2_HELLO_SUB_CMD );

   # Register for event
   $Client->AddEvent( EVENT_DROP_ID );

   # Register for log
   $Client->AddLog( GEN_TEMPORAL_ANALYZER );

   # Register for debug messages
   $Client->AddMessage( MSG_ID_AAGPS, MSG_LVL_HIGH );
   $Client->AddMessage( MSG_ID_AAGPS, MSG_LVL_ERROR );
   $Client->AddMessage( MSG_ID_AAGPS, MSG_LVL_FATAL );

   # Register for strings
   $Client->AddString( ERROR );
   $Client->AddString( AUTOMATION );
   $Client->AddString( CONNECTION );

   $Client->CommitConfig();

   print "\nClient configured for the following:\n"
       . "   0       Version Information Request\n"
       . "   0       Version Information Response\n"
       . "   [19, 0] EFS2/Hello Request\n"
       . "   [19, 0] EFS2/Hello Response\n"
       . "   256     EVENT_DROP_ID\n"
       . "   0x1019  General Temporal Analyzer\n"
       . "   [24, 2] AAGPS/High\n"
       . "   [24, 3] AAGPS/Error\n"
       . "   [24, 4] AAGPS/Fatal\n"
       . "   2       Error string\n"
       . "   3       Automation string\n"
       . "   4       Connection state string\n";

   $QXDM2->UnregisterClient( $Handle );
}

# Main body of script
sub Execute
{
   # Launch QXDM
   my $RC = Initialize();
   if ($RC == false)
   {
      return;
   }

   # Get QXDM version
   my $Version = $QXDM->{AppVersion};
   print "\nQXDM Version: " . $Version;

   # Add items to the client
   AddItems();
}

Execute();