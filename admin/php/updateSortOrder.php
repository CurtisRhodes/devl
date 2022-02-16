<?php

   include('settings.php');
   $pdo = pdoConn();

   $linkArray = $_GET['linkArray'];

   $cmd = $pdo->query("select * from VwLatestUpdateGalleries ");

   $pdo = null;

   $results = $cmd->fetchAll();

   echo json_encode($results);


/*
        public string UpdateSortOrder(List<SortOrderItem> links)

                        int folderId = links[0].FolderId;
                        List<CategoryImageLink> catLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                        int insertThrottle = 0;
                        foreach (SortOrderItem link in links)
                        {
                            CategoryImageLink catLink = catLinks.Where(x => x.ImageLinkId == link.ItemId).FirstOrDefault();
                            if (catLink != null)
                            {
                                if (catLink.SortOrder != link.SortOrder)
                                {
                                    catLink.SortOrder = link.SortOrder;
                                    if (++insertThrottle % 25 == 0)
                                    {
                                        db.SaveChanges();
                                    }
                                }
                            }
                        }
                        db.SaveChanges();
                        success = "ok";
                    }
                    catch (Exception ex)
                    {
                        success = Helpers.ErrorDetails(ex);
                        db.Dispose();
                    }
                }
            }
            catch (Exception ex)
            {
                success += Helpers.ErrorDetails(ex);
            }
            return success;
        }
*/

