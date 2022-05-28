


select date_format(Occured,'%M %D %Y') 'day', format(Hits,0) 'page hits', format(NewVisitors,0) 'new visitors', format(Visits,0) 'Visits' 
from oggleboo_registo.MetricsMatrix where Occured > current_date()-11 order by Occured desc; -- 0.046;
