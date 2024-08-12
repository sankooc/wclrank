function GetRealmName()
  return "碧玉矿洞";
end
require 'WclInspector.data'
require 'WclInspector.realm.5042'

function time()
  return os.time()
end
function tinsert(tb, d)
  table.insert(tb, d)
end
function string:split(delimiter)
  local result = {}
  local from  = 1
  local delim_from, delim_to = string.find( self, delimiter, from  )
  while delim_from do
    table.insert( result, string.sub( self, from , delim_from-1 ) )
    from  = delim_to + 1
    delim_from, delim_to = string.find( self, delimiter, from  )
  end
  table.insert( result, string.sub( self, from  ) )
  return unpack(result)
end
function strsplit(delimiter, str)
  return string.split(str,delimiter);
end
function strlen(str)
  return string.len (str)
end
function checking(code, str)
  local aa = doMap(code, true)
  if aa ~= str then
    print(code, aa, str)
  end
end

checking("00", "鲜血死骑")
checking("01", "冰霜死骑")
checking("02", "邪恶死骑")
checking("10", "平衡德鲁伊")
checking("11", "野性德鲁伊")
checking("20", "野兽猎人")
checking("21", "生存猎人")
checking("22", "射击猎人")
checking("30", "奥术法师")
checking("31", "火焰法师")
checking("32", "冰霜法师")
checking("40", "惩戒圣骑")
checking("50", "暗影牧师")
checking("60", "奇袭潜行者")
checking("61", "狂徒潜行者")
checking("70", "增强萨满")
checking("71", "元素萨满")
checking("80", "痛苦术士")
checking("81", "恶魔术士")
checking("82", "毁灭术士")
checking("90", "武器战士")
checking("91", "狂怒战士")


local name = "大尾巴黄鼠狼";
-- local name = "Yangsteak";
local ins = getWCLinfo(name, true);
if ins ~= nil then
    for _,v in ipairs(ins) do
      print(v)
    end
end
print('-------')
local ins = getWCLinfo(name, false);
local str = '';
if ins ~= nil then
    for _,v in ipairs(ins) do
      if strlen(str) > 0 then
        str = str..",  "..v
      else
        str = v
      end
    end
end
print(str)


-- print(os.time())
-- local now = time();
-- print(now)
-- print(now > 1000)