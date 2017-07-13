////////////////////////////////////////////////////////////////////////////
function EFS2_RequestForFileStat(path) {
    SendRequest(EFS2_DIAG_STAT, path);
} ////////////////////////////////////////////////////////////////////////////
function EFS2_Read_From_File(FD, nBytes, offset) 
{ 
    var cmd_str = FD + " " + nBytes + " " + offset;
    SendRequest(EFS2_DIAG_READ, cmd_str);
} //
//////////////////////////////////////////////////////////////////////////
function EFS2_Close_File(FD) {
    SendRequest(EFS2_DIAG_CLOSE, FD);
} //
//////////////////////////////////////////////////////////////////////////
function EFS2_Open_File(path, Flag, Mode)
 {    
    var flags = -1;
    var mode = Mode;
    var cmd_str = "";
    switch (Flag) 
    {
    case "O_RDONLY":
        {
            flags = 0;
            break;
        }
    case "O_WRONLY":
        {
            flags = 1;
            break;
        }
    case "O_RDWR":
        {
            flags = 2;
            break;
        }
    case "O_CREAT":
        {
            flags = 577;
            break;
        }
    case "O_TRUNC":
        {
            flags = 1002;
            break;
        }
    } // close switch
 
 

    cmd_str += flags + " "; // File flags
    cmd_str += Mode + " "; // mode
    cmd_str += path;
    SendRequest(EFS2_DIAG_OPEN, cmd_str);
} // close function 
////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
function EFS2_Delete_File(file_path) {
    SendRequest(EFS2_DIAG_UNLINK, file_path);
} //
///////////////////////////////////////////////////////////////////////////////////
function EFS2_Write_to_File(fd, offset, str) {
    var cmd_str = "";
    cmd_str += fd + " "; // file descriptor
    cmd_str += offset + " "; // offset from start of file
    cmd_str += str;
    SendRequest(EFS2_DIAG_WRITE, cmd_str);
} //

function EFS2_Open_Dir(path)
{
 SendRequest(EFS2_DIAG_OPEN_DIR, path);

}
/////////////////////////////////////////////////////////////////////////////////////////////


function EFS2_Make_Dir(path)
{
 SendRequest(EFS2_DIAG_MAKE_DIR, 7 + " " +path);

}
/////////////////////////////////////////////////////////////////////////////////////////////