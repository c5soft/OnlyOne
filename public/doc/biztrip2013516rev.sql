EXEC spExcelAddLink 'Excel','D:\Js\OnlyOne\public\doc\biztrip2013516rev.xlsx'
GO
SET NOCOUNT ON
IF OBJECT_ID('tempdb..#1') IS NOT NULL DROP TABLE #1
SELECT * INTO #1 FROM Excel...Sheet1$
ALTER TABLE #1 ADD 洲 VARCHAR(40)
IF OBJECT_ID('tempdb..#2') IS NOT NULL DROP TABLE #2
SELECT * INTO #2 FROM #1 WHERE 1>2
DECLARE @国家和地区Last VARCHAR(40)='',@Json VARCHAR(8000),@洲Last VARCHAR(40)
DECLARE @序号 VARCHAR(10),@国家和地区 VARCHAR(40),@城市 VARCHAR(800),@币别 VARCHAR(20),@住宿费 MONEY,@伙食费  MONEY,@公杂费 MONEY
DECLARE csList CURSOR  FOR SELECT 序号,国家和地区,城市,币别,住宿费,伙食费,公杂费 FROM #1
DECLARE @KeyWords TABLE(word VARCHAR(20) NOT NULL PRIMARY KEY)
INSERT @KeyWords SELECT 国家和地区 FROM #1 WHERE LEN(国家和地区)>0 GROUP BY 国家和地区
OPEN csList
FETCH NEXT FROM csList INTO @序号,@国家和地区,@城市,@币别,@住宿费,@伙食费,@公杂费
PRINT '{"住宿费伙食费公杂费开支标准":['
WHILE @@Fetch_Status=0 BEGIN
  IF LEN(ISNULL(@城市,''))>0 INSERT @KeyWords SELECT slice FROM dbo.SplitString(@城市,'、') WHERE slice NOT IN (SELECT word FROM @KeyWords)
  IF ISNUMERIC(@序号)=0 SELECT @洲Last=@国家和地区
  SELECT @国家和地区=CASE WHEN LEN(ISNULL(@国家和地区,''))=0 THEN @国家和地区Last ELSE @国家和地区 END   
  IF @国家和地区Last<>@国家和地区 BEGIN
     --SELECT * FROM #2
     IF LEN(@国家和地区Last)>0 BEGIN
       SELECT TOP 1 @Json='{"国家和地区":"'+国家和地区+'","洲":"'+洲+'","开支标准":[' FROM #2
       SELECT @Json=@Json+'{"序号":"'+ISNULL(序号,'')+'","城市":"'+ ISNULL(城市,'')+'","币别":"'+ISNULL(币别,'')+'"'+
         ',"住宿费":'+ISNULL(CONVERT(VARCHAR(10),住宿费),'null')+
         ',"伙食费":'+ISNULL(CONVERT(VARCHAR(10),伙食费),'null')+
         ',"公杂费":'+ISNULL(CONVERT(VARCHAR(10),公杂费),'null')+'},'
         FROM #2
       SELECT @Json=LEFT(@Json,LEN(@Json)-1)+']},'
       PRINT @Json
       TRUNCATE TABLE #2
     END
     SELECT @国家和地区Last=@国家和地区 
  END
  INSERT #2 VALUES(@序号,@国家和地区,@城市,@币别,@住宿费,@伙食费,@公杂费,@洲Last)
  FETCH NEXT FROM csList INTO @序号,@国家和地区,@城市,@币别,@住宿费,@伙食费,@公杂费  
END
IF EXISTS(SELECT 1 FROM #2) BEGIN
  SELECT TOP 1 @Json='{"国家和地区":"'+国家和地区+'","洲":"'+洲+'","开支标准":[' FROM #2
  SELECT @Json=@Json+'{"序号":"'+ISNULL(序号,'')+'","城市":"'+ ISNULL(城市,'')+'","币别":"'+ISNULL(币别,'')+'"'+
    ',"住宿费":'+ISNULL(CONVERT(VARCHAR(10),住宿费),'null')+
    ',"伙食费":'+ISNULL(CONVERT(VARCHAR(10),伙食费),'null')+
    ',"公杂费":'+ISNULL(CONVERT(VARCHAR(10),公杂费),'null')+'},'
    FROM #2
  SELECT @Json=LEFT(@Json,LEN(@Json)-1)+']}],'
  PRINT @Json
  TRUNCATE TABLE #2
END
CLOSE csList
DEALLOCATE csList
PRINT '"keyWords": ['
SELECT '['+QUOTENAME(dbo.PYStr(word),CHAR(34))+','+QUOTENAME(word,CHAR(34))+'],'+CHAR(13)+CHAR(10) FROM @KeyWords ORDER BY dbo.PYStr(word)
PRINT ']}'
