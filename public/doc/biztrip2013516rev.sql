EXEC spExcelAddLink 'Excel','D:\Js\OnlyOne\public\doc\biztrip2013516rev.xlsx'
GO
SET NOCOUNT ON
IF OBJECT_ID('tempdb..#1') IS NOT NULL DROP TABLE #1
SELECT * INTO #1 FROM Excel...Sheet1$
ALTER TABLE #1 ADD �� VARCHAR(40)
IF OBJECT_ID('tempdb..#2') IS NOT NULL DROP TABLE #2
SELECT * INTO #2 FROM #1 WHERE 1>2
DECLARE @���Һ͵���Last VARCHAR(40)='',@Json VARCHAR(8000),@��Last VARCHAR(40)
DECLARE @��� VARCHAR(10),@���Һ͵��� VARCHAR(40),@���� VARCHAR(800),@�ұ� VARCHAR(20),@ס�޷� MONEY,@��ʳ��  MONEY,@���ӷ� MONEY
DECLARE csList CURSOR  FOR SELECT ���,���Һ͵���,����,�ұ�,ס�޷�,��ʳ��,���ӷ� FROM #1
DECLARE @KeyWords TABLE(word VARCHAR(20) NOT NULL PRIMARY KEY)
INSERT @KeyWords SELECT ���Һ͵��� FROM #1 WHERE LEN(���Һ͵���)>0 GROUP BY ���Һ͵���
OPEN csList
FETCH NEXT FROM csList INTO @���,@���Һ͵���,@����,@�ұ�,@ס�޷�,@��ʳ��,@���ӷ�
PRINT '{"ס�޷ѻ�ʳ�ѹ��ӷѿ�֧��׼":['
WHILE @@Fetch_Status=0 BEGIN
  IF LEN(ISNULL(@����,''))>0 INSERT @KeyWords SELECT slice FROM dbo.SplitString(@����,'��') WHERE slice NOT IN (SELECT word FROM @KeyWords)
  IF ISNUMERIC(@���)=0 SELECT @��Last=@���Һ͵���
  SELECT @���Һ͵���=CASE WHEN LEN(ISNULL(@���Һ͵���,''))=0 THEN @���Һ͵���Last ELSE @���Һ͵��� END   
  IF @���Һ͵���Last<>@���Һ͵��� BEGIN
     --SELECT * FROM #2
     IF LEN(@���Һ͵���Last)>0 BEGIN
       SELECT TOP 1 @Json='{"���Һ͵���":"'+���Һ͵���+'","��":"'+��+'","��֧��׼":[' FROM #2
       SELECT @Json=@Json+'{"���":"'+ISNULL(���,'')+'","����":"'+ ISNULL(����,'')+'","�ұ�":"'+ISNULL(�ұ�,'')+'"'+
         ',"ס�޷�":'+ISNULL(CONVERT(VARCHAR(10),ס�޷�),'null')+
         ',"��ʳ��":'+ISNULL(CONVERT(VARCHAR(10),��ʳ��),'null')+
         ',"���ӷ�":'+ISNULL(CONVERT(VARCHAR(10),���ӷ�),'null')+'},'
         FROM #2
       SELECT @Json=LEFT(@Json,LEN(@Json)-1)+']},'
       PRINT @Json
       TRUNCATE TABLE #2
     END
     SELECT @���Һ͵���Last=@���Һ͵��� 
  END
  INSERT #2 VALUES(@���,@���Һ͵���,@����,@�ұ�,@ס�޷�,@��ʳ��,@���ӷ�,@��Last)
  FETCH NEXT FROM csList INTO @���,@���Һ͵���,@����,@�ұ�,@ס�޷�,@��ʳ��,@���ӷ�  
END
IF EXISTS(SELECT 1 FROM #2) BEGIN
  SELECT TOP 1 @Json='{"���Һ͵���":"'+���Һ͵���+'","��":"'+��+'","��֧��׼":[' FROM #2
  SELECT @Json=@Json+'{"���":"'+ISNULL(���,'')+'","����":"'+ ISNULL(����,'')+'","�ұ�":"'+ISNULL(�ұ�,'')+'"'+
    ',"ס�޷�":'+ISNULL(CONVERT(VARCHAR(10),ס�޷�),'null')+
    ',"��ʳ��":'+ISNULL(CONVERT(VARCHAR(10),��ʳ��),'null')+
    ',"���ӷ�":'+ISNULL(CONVERT(VARCHAR(10),���ӷ�),'null')+'},'
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
