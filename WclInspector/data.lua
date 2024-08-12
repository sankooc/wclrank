local CLASSES = {"死骑", "德鲁伊", "猎人", "法师", "圣骑", "牧师", "潜行者", "萨满", "术士", "战士"}
local SPECS = {{"鲜血", "冰霜", "邪恶", "巫妖", "符文", "鲜血"}, {"平衡", "野性", "守护", "恢复", "典狱"}, {"野兽", "生存", "射击"}, {"奥术", "火焰", "冰霜"}, {"神圣","防护","惩戒","正义"}, {"戒律","神圣","暗影"}, {"奇袭", "狂徒", "敏锐"}, {"元素","增强", "恢复"}, {"痛苦", "恶魔", "毁灭"}, {"武器", "狂怒", "防御", "角斗士", "冠军", "混战"}}

function doMap(str, full)
    if str == nil then
        return 'unknown'
    end
    local c = tonumber(string.sub(str, 1, 1))
    local s = tonumber(string.sub(str, 2))
    local _a = CLASSES[c+1]
    local _b = SPECS[c+1][s+1]
    if full then
        return string.format("%s%s", _b, _a)
    end
    return string.format("%s", _b)
end

-- local getCor;
function getCor(rank)
    if (rank < 10) then
        return 255, 102, 204
    end
    if (rank < 100) then
        return 255, 153, 51
    end
    if (rank < 500) then
        return 204, 102, 255
    end
    if (rank < 600) then
        return 51, 51, 255
    end
    return 0, 204, 102
end

-- local getScore;
function getScore(score)
    if (score > 98) then
        return 255, 102, 204
    end
    if (score > 90) then
        return 255, 153, 51
    end
    if (score > 75) then
        return 204, 102, 255
    end
    if (score > 60) then
        return 51, 51, 255
    end
    return 0, 204, 102
end

function getWCLinfo(name, color)
    local info = wclData[name]
    if info == nil then
        return nil;
    end
    return parseData(name, info, color)
end

-- local subs;
function subs(content, color)
    local rank, c, d = strsplit("|", content)
    local rate = tonumber(rank)
    if color then
        local r, g, b = getCor(rate);
        return string.format("[%s]排名:  |cFF%02x%02x%02x%s|r   Score:  |cFF%02x%02x%02x%s|r", doMap(c, false), r, g, b,
            rank, r,
            g, b, d)
    end
    return string.format("天赋[%s]排名:%s", doMap(c, false), rank)
end


function toDate (ts)
    return ts;
end
local stage = "奥杜尔";
-- date("!*t")
function parseData(name, content, color)
    local rs = {};
    local ts, s, ow, det = strsplit("@", content)
    if color then
        tinsert(rs, "[WCL Ulduar]英雄榜");
    end
    local score = tonumber(s)
    if score > 0 then
        if color then
            local r, g, b = getScore(score);
            tinsert(rs, string.format("[%s]平均分:  |cFF%02x%02x%02x%s|r 收入时间:%s", stage, r, g, b, s, ts));
        -- else
        --     tinsert(rs, string.format("%s[%s] %s平均分: %s", name, doMap(c, true), s));
        end
    end
    if strlen(ow) > 0 then
        local rank, c, d = strsplit("|", ow)
        local rate = tonumber(rank)
        if color then
            local r, g, b = getCor(rate);
            tinsert(rs, string.format("[%s]  排名:  |cFF%02x%02x%02x%s|r  天赋:  %s", stage, r, g, b, rank, doMap(c, true)));
        else
            tinsert(rs, string.format("%s[%s] %s WCL平均分: %s", name, doMap(c, true), stage, s));
            tinsert(rs, string.format("排名:%s", rank));
        end
    end
    if strlen(det) > 0 then
        local a1, a2, a3 = strsplit("#", det)
        if a1 ~= nil then
            tinsert(rs, subs(a1, color));
        end
        if a2 ~= nil then
            tinsert(rs, subs(a2, color));
        end
        if a3 ~= nil then
            tinsert(rs, subs(a3, color));
        end
    end
    if not color then
        tinsert(rs, string.format("收入时间:%s", toDate(ts)));
    end
    return rs;
end

_G["parseWCL"] = function(name)
    local info = wclData[name]
    if info == nil then
        return nil;
    end
    return parseData(name, info, false)
end
