﻿//private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
//private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];
//private readonly string repoDomain = ConfigurationManager.AppSettings["ImageRepository"];
//static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
//static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
//static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

let repairReport = {};
function repairLinks(folderId, recurr) {

    try {
        //VerifyFolderRow(folderId, repairReport, db, true);
        //VerifyFolderPaths(folderId, repairReport, db, true);
        PerformFolderChecks(folderId, repairReport, recurr);
    }
    catch (ex) {
        repairReport.Success = Helpers.ErrorDetails(ex);
    }
    return repairReport;
}

function verifyFolderPaths() {
        //private void VerifyFolderPaths(int folderId, RepairReportModel repairReport, OggleBoobleMySqlContext db, bool recurr)
        try {
            let ftpPath;
            let parentFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();

            let subFolders = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();
            foreach(CategoryFolder f in subFolders)
            {
                ftpPath = ftpHost + "/" + imgRepo.Substring(8) + "/" + f.FolderPath;

                if (!FtpUtilies.DirectoryExists(ftpPath)) {
                    System.Threading.Thread.Sleep(1001);
                    repairReport.Errors.Add(f.Id + ", " + f.FolderName + ", " + f.FolderPath);
                    db.ErrorLogs.Add(new ErrorLog()
                        {
                            CalledFrom = "VerifyFolderPaths",
                            ErrorCode = "x77",
                            FolderId = f.Id,
                            ErrorMessage = ftpPath,
                            Occured = DateTime.Now,
                            VisitorId = "XXX"
                        });
                }
                repairReport.PhyscialFilesProcessed++;

            }
            if (recurr)
                foreach(CategoryFolder f in subFolders)
            VerifyFolderPaths(f.Id, repairReport, db, recurr);

            repairReport.Success = "ok";
        }
        catch (e)
        {
            repairReport.Success = Helpers.ErrorDetails(ex);
        }
    }


function verifyFolderRows(folderId,recurr)
{
    try {
        let ftpPath;
        var parentFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
        ftpPath = ftpHost + "/" + imgRepo.Substring(8) + "/" + parentFolder.FolderPath;

        var subFolders = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();

        foreach(CategoryFolder subFolder in subFolders)
        {
            ftpPath = ftpHost + "/" + imgRepo.Substring(8) + "/" + subFolder.FolderPath;
            string[] v = FtpUtilies.GetDirectories(ftpPath);
            foreach(string dirDetail in v)
            {
                string folderName = dirDetail.Substring(dirDetail.IndexOf("<DIR>") + 5).Trim();
                if (db.CategoryFolders.Where(f => f.FolderName == folderName).FirstOrDefault() == null) {
                    repairReport.Errors.Add(folderName + "not found");

                    System.Threading.Thread.Sleep(101);

                    db.ErrorLogs.Add(new ErrorLog()
                            {
                            CalledFrom = "VerifyFolderRow",
                            ErrorCode = "xxx",
                            FolderId = subFolder.Id,
                            ErrorMessage = "folder: " + folderName + " not found",
                            Occured = DateTime.Now,
                            VisitorId = "VFR"
                        });
                    db.SaveChanges();
                }
                repairReport.LinkRecordsProcessed++;
            }
            repairReport.CatLinksRemoved++;
        }
        if (recurr)
            foreach(CategoryFolder f in subFolders)
        VerifyFolderRows(f.Id, repairReport, db, recurr);
        repairReport.Success = "ok";
    }
    catch (Exception ex)
    {
        repairReport.Success = Helpers.ErrorDetails(ex);
        throw;
    }
}


function performFolderChecks() {
    let ftpPath, imageFolderName, imageFolderPath;
    let catFolders = {};
    let childFolders = {};
}
{
// CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();


    ftpPath = ftpHost + "/" + imgRepo.Substring(8) + "/" + dbCategoryFolder.FolderPath;
        imageFolderName = ftpPath.Substring(ftpPath.LastIndexOf("/") + 1);
        childFolders = db.CategoryFolders.Where(c => c.Parent == folderId).ToList();
        folderImages = db.ImageFiles.Where(if1 => if1.FolderId == folderId).ToList();
        catLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
        imageFolderPath = dbCategoryFolder.FolderPath;
        if (dbCategoryFolder.FolderType == "singleChild") {
            CategoryFolder dbParentFolder = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
            imageFolderName = dbParentFolder.FolderName;
        }
    }
                //string folderName = dbCategoryFolder.FolderName;
                List < CategoryImageLink > dbRejCatlinks;
    string ftpFileName, physcialFileName, physcialFileLinkId, rejectFolder, ftpSuccess;
    string renameSuccess = RenamePhyscialFiles(ftpPath, imageFolderName, repairReport);
    if (renameSuccess != "ok") {
        repairReport.Success = renameSuccess + "ftpPath: " + ftpPath + "  imageFolderName: " + imageFolderName;
        return;
    }

    string[] physcialFiles = FtpUtilies.GetFiles(ftpPath);
    if (physcialFiles.Length > 0 && physcialFiles[0].StartsWith("ERROR")) {
        repairReport.Success = physcialFiles[0];
        return;
    }

                #region 0 rename ImageFiles to expected name
    List < ImageFile > dbFolderImageFiles;
    using(var db = new OggleBoobleMySqlContext())
        {
            dbFolderImageFiles = db.ImageFiles.Where(if1 => if1.FolderId == folderId).ToList();

    string expectedFileName;
    foreach(ImageFile imageFile in dbFolderImageFiles)
    {
        if (imageFile.FileName.LastIndexOf(".") < 5) {
            imageFile.FileName = "xxxxx.jpg";
            //repairReport.Errors.Add("bad filename: " + imageFile.FileName + "folder: " + imageFile.FolderId);
        }
        expectedFileName = imageFolderName + "_" + imageFile.Id + imageFile.FileName.Substring(imageFile.FileName.LastIndexOf("."));
        if (imageFile.FileName != expectedFileName) {
            imageFile.FileName = expectedFileName;
            db.SaveChanges();
            repairReport.ImageFilesRenamed++;
        }
    }
}
                #endregion

                #region 1. make sure every physicalFile has an ImageFile row
ImageFile dbFolderImageFile;
for (int i = 0; i < physcialFiles.Length; i++)
{
    physcialFileName = physcialFiles[i];
    physcialFileLinkId = physcialFileName.Substring(physcialFileName.LastIndexOf("_") + 1, 36);
    dbFolderImageFile = dbFolderImageFiles.Where(f => f.Id == physcialFileLinkId).FirstOrDefault();
    if (dbFolderImageFile == null) {
        ImageFile dbMisplacedImageFile;
        using(var db = new OggleBoobleMySqlContext())
            {
                dbMisplacedImageFile = db.ImageFiles.Where(m => m.Id == physcialFileLinkId).FirstOrDefault();
    }
    if (dbMisplacedImageFile != null) {
        if (dbMisplacedImageFile.FolderId == -6) {
            // should have moved file to rejects
            //string newFileName = ftpPath + "/" + dbCategoryFolder.FolderPath + "/" + physcialFileName;
            ftpFileName = ftpPath + "/" + physcialFileName;
            rejectFolder = ftpHost + "/archive.OggleBooble.com/rejects/" + dbMisplacedImageFile.FileName;
            if (FtpUtilies.MoveFile(ftpFileName, rejectFolder) == "ok") {
                using(var db = new OggleBoobleMySqlContext())
                    {
                        dbRejCatlinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == dbMisplacedImageFile.Id).ToList();
                if (dbRejCatlinks.Count > 0) {
                    foreach(CategoryImageLink dbRejCatlink in dbRejCatlinks)
                    {
                        if (dbRejCatlink.ImageCategoryId != -6) {
                            db.CategoryImageLinks.Remove(dbRejCatlink);
                            repairReport.CatLinksRemoved++;
                        }
                    }
                    db.SaveChanges();
                }
            }
            repairReport.ImageFilesMoved++;
        }
    }
    else {
        //var catLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == physcialFileLinkId).ToList();
        bool itsok = false;
        foreach(CategoryImageLink catLink in catLinks)
        {
            if (catLink.ImageCategoryId == dbMisplacedImageFile.FolderId) {
                itsok = true;
                break;
            }
        }
        if (!itsok) {
            using(var db = new OggleBoobleMySqlContext())
                {
                    dbMisplacedImageFile.FolderId = folderId;
            db.SaveChanges();
            repairReport.ImageFilesMoved++;
        }
    }
}
                        }  //  dbMisplacedImageFile != null
                        else
{
    string newFileName = imgRepo + "/" + imageFolderPath + "/" + physcialFileName;
    ImageFileInfo imageFileInfo = GetImageFileInfo(newFileName);
    CategoryImageLink ktest;
    using(var db = new OggleBoobleMySqlContext())
        {
            ImageFile imageFile = new ImageFile()
                                {
        Id = physcialFileLinkId,
            Acquired = DateTime.Now,
            ExternalLink = "??",
            FileName = physcialFileName,
            FolderId = folderId,
            Height = imageFileInfo.Height,
            Size = imageFileInfo.Size,
            Width = imageFileInfo.Width
    };
    db.ImageFiles.Add(imageFile);
    dbFolderImageFiles.Add(imageFile);
    db.SaveChanges();
    repairReport.ImageFilesAdded++;
    ktest = db.CategoryImageLinks.Where(l => (l.ImageCategoryId == folderId) && (l.ImageLinkId == physcialFileLinkId)).FirstOrDefault();
}
if (ktest == null) {
    try {
        using(var db = new OggleBoobleMySqlContext())
            {
                int nextSortOrder = 0;
        if (db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count() > 0) {
            nextSortOrder = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Max(l => l.SortOrder) + 2;
        }
        db.CategoryImageLinks.Add(new CategoryImageLink()
                                        {
                ImageCategoryId = folderId,
                ImageLinkId = physcialFileLinkId,
                SortOrder = nextSortOrder
            });
        db.SaveChanges();
        repairReport.CatLinksAdded++;
    }
                                }
                                catch (Exception ex)
{
    repairReport.Errors.Add("ktest lied: " + Helpers.ErrorDetails(ex));
}
                            }
                            else
{
    if (dbFolderImageFile.Size == 0) {
        //string newFileName = imgRepo + "/" + imageFolderPath + "/" + physcialFileName;
        //ImageFileInfo imageFileInfo2 = GetImageFileInfo(newFileName);
        if (imageFileInfo.Size == 0) {

            if (FtpUtilies.DeleteFile(ftpPath + "/" + dbFolderImageFile.FileName) == "ok") {
                using(var db = new OggleBoobleMySqlContext())
                    {
                        db.CategoryImageLinks.RemoveRange(db.CategoryImageLinks.Where(l => l.ImageLinkId == dbFolderImageFile.Id).ToList());
                db.ImageFiles.Remove(dbFolderImageFile);
                db.SaveChanges();
                repairReport.ZeroLenImageFilesRemoved++;
            }
        }
    }
    else {
        using(var db = new OggleBoobleMySqlContext())
            {
                dbFolderImageFile.Size = imageFileInfo.Size;
        dbFolderImageFile.Height = imageFileInfo.Height;
        dbFolderImageFile.Width = imageFileInfo.Width;
        db.SaveChanges();
        repairReport.ZeroLenFileResized++;
    }
}
                                }
                            }
                        }
                    } // dbFolderImageFile == null
repairReport.PhyscialFilesProcessed++;
                }
                #endregion

                #region 2. Make sure every ImageFile row has a physcial file
// rebuild list                 
var physcialFileLinkIds = new List < string > ();

for (int i = 0; i < physcialFiles.Length; i++)
{
    physcialFileLinkIds.Add(physcialFiles[i].Substring(physcialFiles[i].LastIndexOf("_") + 1, 36));
}

if (physcialFileLinkIds.Count() != dbFolderImageFiles.Count()) {
    if (physcialFileLinkIds.Count() > dbFolderImageFiles.Count()) {
        using(var db = new OggleBoobleMySqlContext())
            {
                foreach (string pflinkId in physcialFileLinkIds)
        {
            dbFolderImageFile = db.ImageFiles.Where(i => i.Id == pflinkId).FirstOrDefault();
            if (dbFolderImageFile == null) {
                db.ImageFiles.Add(new ImageFile()
                                    {
                        Id = pflinkId,
                        FolderId = folderId,
                        FileName = ""
                    });
                db.SaveChanges();
            }
            else if (dbFolderImageFile.FolderId != folderId) {
                List < CategoryImageLink > links = db.CategoryImageLinks.Where(l => l.ImageLinkId == dbFolderImageFile.Id).ToList();
                if (links.Count() > 0) {
                    dbFolderImageFile.FolderId = folderId;
                    db.SaveChanges();
                    repairReport.NoLinkImageFiles++;
                }
                else {
                    string imageFileToRemove = ftpPath + "/" + imageFolderName + "_" + pflinkId + ".jpg";
                    rejectFolder = ftpHost + "/archive.OggleBooble.com/rejects/" + imageFolderName + "_" + pflinkId + ".jpg";
                    ftpSuccess = FtpUtilies.MoveFile(imageFileToRemove, rejectFolder);
                    //.DeleteFile(ftpPath + "/" + imageFolderName + "_" + pflinkId + ".jpg");
                    //ftpSuccess = FtpUtilies.DeleteFile(ftpPath + "/" + imageFolderName + "_" + pflinkId + ".jpg");
                    if (ftpSuccess == "ok") {
                        repairReport.ImageFilesRemoved++;
                        repairReport.Errors.Add("I moved a file to rejects : " + imageFolderName + "_" + pflinkId);
                    }
                    else
                        repairReport.Errors.Add("I wanted to delete : " + imageFolderName + "_" + pflinkId);
                }
            }
        }
    }
}
                }

foreach(ImageFile imageFile in dbFolderImageFiles)
{
    if (!physcialFileLinkIds.Contains(imageFile.Id)) {
        if (imageFile.ExternalLink.IndexOf("http") > -1) {
            // Download missing File
            if (imageFile.FileName.LastIndexOf(".") < 2) {
                repairReport.Errors.Add("bad filename: " + imageFile.FileName + "folder: " + imageFile.FolderId);
            }
            else {
                string expectedFileName = imageFolderName + "_" + imageFile.Id + imageFile.FileName.Substring(imageFile.FileName.LastIndexOf("."));
                string newFileName = imgRepo + "/" + imageFolderPath + "/" + expectedFileName;
                string downLoadSuccess = DownLoadImage(ftpPath, imageFile.ExternalLink, expectedFileName);
                if (downLoadSuccess == "ok") {
                    repairReport.ImagesDownLoaded++;

                    using(var db = new OggleBoobleMySqlContext())
                        {
                            if (db.CategoryImageLinks.Where(l => l.ImageLinkId == imageFile.Id).FirstOrDefault() == null)
                    {
                        db.CategoryImageLinks.Add(new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = imageFile.Id, SortOrder = 9999 });
                        db.SaveChanges();
                    }
                }
            }
                                else
            {
                //repairReport.Errors.Add("download faild: " + imageFile.ExternalLink);
                using(var db = new OggleBoobleMySqlContext())
                    {
                        if (db.CategoryImageLinks.Where(l => l.ImageLinkId == imageFile.Id).Count() > 0)
                {
                    db.CategoryImageLinks.RemoveRange(db.CategoryImageLinks.Where(l => l.ImageLinkId == imageFile.Id).ToList());
                    db.SaveChanges();
                }
                var ulIm = db.ImageFiles.Where(i => i.Id == imageFile.Id).FirstOrDefault();
                if (ulIm != null) {
                    db.ImageFiles.Remove(ulIm);
                    db.SaveChanges();
                    repairReport.ImageFilesRemoved++;
                }
            }
        }
    }
}
                        else
{
    repairReport.Errors.Add("ImageFile with no physcial file " + imageFile.Id);
    using(var db = new OggleBoobleMySqlContext())
        {
            if (db.CategoryImageLinks.Where(l => l.ImageLinkId == imageFile.Id).Count() > 0)
    {
        db.CategoryImageLinks.RemoveRange(db.CategoryImageLinks.Where(l => l.ImageLinkId == imageFile.Id).ToList());
    }
    var ulIm = db.ImageFiles.Where(i => i.Id == imageFile.Id).FirstOrDefault();
    if (ulIm != null) {
        db.ImageFiles.Remove(ulIm);
        db.SaveChanges();
        repairReport.ImageFilesRemoved++;
    }
}
                        }
                    }
repairReport.ImageFilesProcessed++;
                }
                #endregion

                #region 3. check if there is a catlink for every physcial file 

                using(var db = new OggleBoobleMySqlContext())
    {
        foreach (string pfLinkId in physcialFileLinkIds)
{
    if (db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId && l.ImageLinkId == pfLinkId).FirstOrDefault() == null) {
        int nextSortOrder = 0;
        if (db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count() > 0) {
            nextSortOrder = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Max(l => l.SortOrder) + 2;
        }
        db.CategoryImageLinks.Add(new CategoryImageLink()
                            {
                ImageCategoryId = folderId,
                ImageLinkId = pfLinkId,
                SortOrder = nextSortOrder
            });
        db.SaveChanges();
        repairReport.CatLinksAdded++;

    }
    repairReport.LinkRecordsProcessed++;
}
                }
                #endregion

repairReport.Success = "ok";

            }            
            catch (Exception ex)
{
    repairReport.Errors.Add(Helpers.ErrorDetails(ex));
    repairReport.Success = "ok";
    repairReport.Success = Helpers.ErrorDetails(ex);
}
if (recurr) {
    //var childFolders = db.CategoryFolders.Where(c => c.Parent == folderId).ToList();
    foreach(CategoryFolder childFolder in childFolders)
    {
        PerformFolderChecks(childFolder.Id, repairReport, recurr);
    }
}
        }

        private string RenamePhyscialFiles(string ftpPath, string folderName, RepairReportModel repairReport)
{
    string success;
    try {
        string fileName, newFileName, ext, possibleGuid = "";
        string[] physcialFiles = FtpUtilies.GetFiles(ftpPath);
        if ((physcialFiles.Length == 1) && (physcialFiles[0].StartsWith("ERROR"))) {
            return physcialFiles[0];
        }
        for (int i = 0; i < physcialFiles.Length; i++)
        {
            fileName = physcialFiles[i];
            ext = fileName.Substring(fileName.LastIndexOf("."));
            if (ext == ".webp") {
                ext = ".jpg";
                newFileName = fileName.Substring(0, fileName.LastIndexOf(".")) + ".jpg";
                FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
                repairReport.ExtensionChanged++;
            }
            if (fileName.LastIndexOf("_") - 1 < -1) {
                possibleGuid = Guid.NewGuid().ToString();
                //possibleGuid = null;
            }
            else {
                if (fileName.Substring(fileName.LastIndexOf("_") + 1).Length < 36) {
                    possibleGuid = Guid.NewGuid().ToString();
                }
                else {
                    possibleGuid = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                    Guid.TryParse(possibleGuid, out Guid outGuid);
                    if (outGuid == Guid.Empty)
                        possibleGuid = Guid.NewGuid().ToString();
                }
            }
            try {
                if (fileName != (folderName + "_" + possibleGuid + ext)) {
                    newFileName = folderName + "_" + possibleGuid + ext;
                    FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
                    repairReport.PhyscialFileRenamed++;
                }
                else
                    newFileName = "ok";
            }
            catch (Exception ex)
            {
                newFileName = Helpers.ErrorDetails(ex);
                //newFileName = folderName + "_" + Guid.NewGuid().ToString() + ext;
                //FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
                //repairReport.PhyscialFileRenamed++;
            }
            //}
            //else
            //{
            //    newFileName = folderName + "_" + Guid.NewGuid().ToString() + ext;
            //    FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
            //    repairReport.PhyscialFileRenamed++;
            //}
            //}
            //else
            //{
            //    newFileName = folderName + "_" + Guid.NewGuid().ToString() + ext;
            //    var sss = FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
            //    if (sss == "ok")
            //        repairReport.PhyscialFileRenamed++;
            //}
        }
        success = "ok";
    }
    catch (Exception ex)
    {
        success = Helpers.ErrorDetails(ex);
    }
    return success;
}

        private ImageFileInfo GetImageFileInfo(string imgFileName)
{
    ImageFileInfo imageFileInfo = new ImageFileInfo();
    try {
        string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
        using(WebClient wc = new WebClient())
        {
            wc.DownloadFile(new Uri(imgFileName), appDataPath + "tempImage.tmp");
        }
        using(var fileStream = new FileStream(appDataPath + "tempImage.tmp", FileMode.Open, FileAccess.Read, FileShare.Read))
            {
                imageFileInfo.Size = fileStream.Length;
        try {
            using(var image = System.Drawing.Image.FromStream(fileStream, false, false))
                {
                    imageFileInfo.Width = image.Width;
            imageFileInfo.Height = image.Height;
        }
                    }
    catch (Exception ex)
    {
        if (Helpers.ErrorDetails(ex).ToString() == "{Parameter is not valid.}")
            imageFileInfo.Success = "unable to get width and height of " + imgFileName;
        else
            imageFileInfo.Success = "problem getting filesize" + Helpers.ErrorDetails(ex);
    }
}
imageFileInfo.Success = "ok";
            }
            catch (Exception ex)
{
    imageFileInfo.Success = Helpers.ErrorDetails(ex);
}
return imageFileInfo;
        }

        private string DownLoadImage(string ftpPath, string externalFileName, string newFileName)
{
    string success = "ok";
    try {
        string extension = newFileName.Substring(newFileName.Length - 4);
        string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
        using(WebClient wc = new WebClient())
        {
            wc.DownloadFile(new Uri(externalFileName), appDataPath + "tempImage" + extension);
        }

        FtpWebRequest webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + newFileName);
        webRequest.Credentials = new NetworkCredential(ftpUserName, ftpPassword);
        webRequest.Method = WebRequestMethods.Ftp.UploadFile;


        using(Stream requestStream = webRequest.GetRequestStream())
        {
            byte[] fileContents = System.IO.File.ReadAllBytes(appDataPath + "tempImage" + extension);
            webRequest.ContentLength = fileContents.Length;
            requestStream.Write(fileContents, 0, fileContents.Length);
            requestStream.Flush();
            requestStream.Close();
        }
    }
    catch (Exception ex)
    {
        success = Helpers.ErrorDetails(ex);
    }
    return success;
}

public class DupeGroup {
    public string IpAddress { get; set; }
            public int Count { get; set; }
        }

[HttpGet]
[Route("api/RepairLinks/RemoveDuplicateIps")]
        public DupeIpRepairReportModel RemoveDuplicateIps()
{
    DupeIpRepairReportModel repairReport = new DupeIpRepairReportModel();
    try {
        using(var db = new OggleBoobleMySqlContext())
            {
                int imageHitsChanged, pageHitsChanged, activityLogsChanged;

        //var IpAddresses = db.Visitors.Where(v => v.Country != "ZZ" && v.IpAddress != "error").Select(v => v.IpAddress).Distinct().ToList();

        var IpGroupings = db.Visitors.Where(v => v.Country != "ZZ" && v.IpAddress != "error"
            && v.IpAddress != "00.00.00" && v.IpAddress != "00.11.11")
            .GroupBy(v => v.IpAddress).Where(v => v.Count() > 1).ToList();

        foreach(var ipGrouping in IpGroupings)
        {
            string firstVisitorId = ipGrouping.First().VisitorId;
            foreach(Visitor duplicateIp in ipGrouping)
            {
                //List<Visitor> dupIps = db.Visitors.Where(v => v.IpAddress == ipAddress).ToList();
                //string firstVisitorId = dupIps[0].VisitorId;
                if (duplicateIp.VisitorId != firstVisitorId) {
                    try {
                        imageHitsChanged = db.Database.ExecuteSqlCommand(
                            "Update OggleBooble.ImageHit set VisitorId = '" + firstVisitorId + "' where VisitorId='" + duplicateIp.VisitorId + "';");
                        repairReport.ImageHitsUpdated += imageHitsChanged;
                    }
                    catch (Exception ex)
                    {
                        repairReport.Errors.Add(Helpers.ErrorDetails(ex));
                    }

                    try {
                        pageHitsChanged = db.Database.ExecuteSqlCommand(
                            "Update OggleBooble.PageHit set VisitorId = '" + firstVisitorId + "' where VisitorId='" + duplicateIp.VisitorId + "';");
                        repairReport.PageHitsUpdated += pageHitsChanged;
                    }
                    catch (Exception ex)
                    {
                        repairReport.Errors.Add(Helpers.ErrorDetails(ex));
                    }

                    try {
                        activityLogsChanged = db.Database.ExecuteSqlCommand(
                            "Update OggleBooble.ActivityLog set VisitorId ='" + firstVisitorId + "' where VisitorId='" + duplicateIp.VisitorId + "';");
                        repairReport.ActivityLogsUpdated += activityLogsChanged;
                    }
                    catch (Exception ex)
                    {
                        repairReport.Errors.Add(Helpers.ErrorDetails(ex));
                    }

                    try {
                        db.RetiredVisitors.Add(new RetiredVisitor()
                                    {
                                VisitorId = duplicateIp.VisitorId,
                                IpAddress = duplicateIp.IpAddress,
                                City = duplicateIp.City,
                                Country = duplicateIp.Country,
                                GeoCode = duplicateIp.GeoCode,
                                InitialPage = duplicateIp.InitialPage,
                                InitialVisit = duplicateIp.InitialVisit,
                                Region = duplicateIp.Region
                            });
                        db.Visitors.Remove(duplicateIp);
                        db.SaveChanges();
                        repairReport.VisitorRowsRemoved++;
                    }
                    catch (Exception ex)
                    {
                        repairReport.Errors.Add(Helpers.ErrorDetails(ex));
                    }
                }
            }

            repairReport.TotalMultiIPsRepaired++;
        }
    }
                repairReport.Success = "ok";
}
            catch (Exception ex)
{
    repairReport.Success = Helpers.ErrorDetails(ex);
}
return repairReport;
        }

[HttpGet]
        public string UniquifyIps(string badIp) {
    string success;
    try {
        using(var db = new OggleBoobleMySqlContext())
            {
                List<Visitor> dbVisitors = db.Visitors.Where(v => v.IpAddress == badIp).ToList();
                    foreach (Visitor visitor in dbVisitors) {
                        visitor.IpAddress = RandomString(10);
                    db.SaveChanges();                    
                    }
                }
                    success = "ok";
            }
                    catch (Exception ex)
                    {
                        success = Helpers.ErrorDetails(ex);
            }
                    return success;
        }

                    private readonly Random _random = new Random();
                    private string RandomString(int size, bool lowerCase = false) {
            var builder = new System.Text.StringBuilder(size);
                    // Unicode/ASCII Letters are divided into two blocks
                    // (Letters 65–90 / 97–122):
                    // The first group containing the uppercase letters and
                    // the second group containing the lowercase.  

                    // char is a single Unicode character  
                    char offset = lowerCase ? 'a' : 'A';
                    const int lettersOffset = 26; // A...Z or a..z: length=26

                    for (var i = 0; i < size; i++)
                    {
                var @char = (char)_random.Next(offset, offset + lettersOffset);
                    builder.Append(@char);
            }
                    return lowerCase ? builder.ToString().ToLower() : builder.ToString();
        }


                    public class DupeStaticPageGroup
                    {
                        public string VisitorId {get; set; }
                    public int FolderId {get; set; }
                    public string Occured {get; set; }
                    public int Count {get; set; }
        }
                    [HttpGet]
                    [Route("api/RepairLinks/RemoveDuplicateStaticPageHits")]
                    public DupeIpRepairReportModel RemoveDuplicateStaticPageHits()
                    {
                        DupeIpRepairReportModel repairReport = new DupeIpRepairReportModel();
                    try
                    {
                        string dupeDay;
                    using (var db = new OggleBoobleMySqlContext())
                    {
                        List < DupeStaticPageGroup > dupGroups = db.Database.SqlQuery<DupeStaticPageGroup>("select VisitorId, FolderId, " +
                            "date_format(Occured,'%Y-%m-%d') 'Occured', count(*) 'Count' from StaticPageHit " +
                        "group by VisitorId, FolderId, date_format(Occured,'%Y-%m-%d') having count(*) > 1").ToList();

                            foreach (DupeStaticPageGroup dupGroup in dupGroups)
                        {
                            repairReport.PageHitsUpdated++;
                        dupeDay = dupGroup.Occured;
                        List<StaticPageHit> duplicateStaticPages = db.StaticPageHits.
                            Where(sph => sph.VisitorId == dupGroup.VisitorId
                            && sph.FolderId == dupGroup.FolderId && dupGroup.Occured == dupeDay).ToList();
                            //StaticPageHit firstVisitor = duplicateStaticPages[0];
                            for (int i = 0; i < duplicateStaticPages.Count; i++) {
                            if (i > 0) {
                                db.StaticPageHits.Remove(duplicateStaticPages[i]);
                            repairReport.VisitorRowsRemoved++;
                            }
                        }
                            db.SaveChanges();
                    }
                            repairReport.Success = "ok";
                }
            }
                            catch (Exception ex)
                            {
                                repairReport.Success = Helpers.ErrorDetails(ex);
            }
                            return repairReport;
        }
    }
}