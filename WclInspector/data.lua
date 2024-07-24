local CLASSES = {"死骑", "德鲁伊", "猎人", "法师", "圣骑", "牧师", "潜行者", "萨满", "术士", "战士"}
local SPECS = {{"鲜血", "冰霜", "邪恶"}, {"平衡", "野性"}, {"野兽", "生存", "射击"}, {"奥术", "火焰", "冰霜"}, {"惩戒"}, {"暗影"}, {"奇袭", "狂徒"}, {"增强", "元素"}, {"痛苦", "恶魔", "毁灭"}, {"武器", "狂怒"}}

-- local doMap;
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
    return parseData(info, color)
end

-- local subs;
function subs(content, color)
    local rank, c, d = strsplit("|", content)
    local rate = tonumber(rank)
    if color then
        local r, g, b = getCor(rate);
        return string.format("[%s]排名:  |cFF%02x%02x%02x%04s|r   DPS:  |cFF%02x%02x%02x%s|r", doMap(c, false), r, g, b,
            rank, r,
            g, b, d)
    end
    return string.format("%s天赋排名:%s", doMap(c, false), rank)
end

-- local parseData;
function parseData(content, color)
    local rs = {};
    local ts, s, ow, det = strsplit("@", content)
    tinsert(rs, string.format("[WCL]英雄榜 收录时间 %s", ts));

    local score = tonumber(s)
    if score > 0 then
        if color then
            local r, g, b = getScore(score);
            tinsert(rs, string.format("[WCL]平均分:  |cFF%02x%02x%02x%s|r", r, g, b, s));
        else
            tinsert(rs, string.format("[WCL]平均分: %s", s));
        end
    end
    if strlen(ow) > 0 then
        local rank, c, d = strsplit("|", ow)
        local rate = tonumber(rank)
        if color then
            local r, g, b = getCor(rate);
            tinsert(rs, string.format("[总]  排名:  |cFF%02x%02x%02x%04s|r  天赋:  %s", r, g, b, rank, doMap(c, true)));
        else
            tinsert(rs, string.format("WCL DPS总排名:%s [%s]", rank, doMap(c, true)));
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
    return rs;
end

_G["parseWCL"] = function(name)
    local info = wclData[name]
    if info == nil then
        return nil;
    end
    return parseData(info, false)
end
