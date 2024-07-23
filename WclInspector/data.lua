local Mapper = {
    ["WARRIOR"] = "战士",
    ["Protection"] = "防护",
    ["Arms"] = "武器",
    ["Fury"] = "狂怒",
    ["WARLOCK"] = "术士",
    ["Affliction"] = "痛苦",
    ["Demonology"] = "恶魔",
    ["Destruction"] = "毁灭",
    ["SHAMAN"] = "萨满",
    ["Restoration"] = "恢复",
    ["Enhancement"] = "增强",
    ["Elemental"] = "元素",
    ["ROGUE"] = "潜行者",
    ["Assassination"] = "奇袭",
    ["Combat"] = "狂徒",
    ["Subtlety"] = "敏锐",
    ["PRIEST"] = "牧师",
    ["Discipline"] = "戒律",
    ["Holy"] = "神圣",
    ["Shadow"] = "暗影",
    ["PALADIN"] = "圣骑士",
    ["Retribution"] = "惩戒",
    ["MAGE"] = "法师",
    ["Arcane"] = "奥术",
    ["Fire"] = "火焰",
    ["Frost"] = "冰霜",
    ["HUNTER"] = "猎人",
    ["Survival"] = "生存",
    ["Marksmanship"] = "射击",
    ["BeastMastery"] = "野兽掌控",
    ["DRUID"] = "德鲁伊",
    ["Guardian"] = "守护",
    ["Feral"] = "野性",
    ["Balance"] = "平衡",
    ["DEATHKNIGHT"] = "死骑",
    ["Blood"] = "鲜血",
    ["Unholy"] = "邪恶"
}

function doMap(str, full)
    if str == nil then
        return 'unknown'
    end
    local a, b = string.split("-", str, 2)
    if a ~= nil and b ~= nil then
        local _a = Mapper[string.upper(a)]
        local _b = Mapper[b]
        if full then
            return string.format("%s%s", _b, _a)
        end
        return string.format("%s", _b)
    end
    return 'unknown'
end

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

function getWCLinfo(name)
    local info = wclData[name]
    if info == nil then
        return nil;
    end
    return parseData(info)
end

function subs(content)
    local rank, c, d = strsplit("|", content)
    local rate = tonumber(rank)
    local r, g, b = getCor(rate);
    return string.format("【%s】排名:   |cFF%02x%02x%02x%s|r   DPS:  |cFF%02x%02x%02x%s|r", doMap(c, false), r, g, b, rank, r,
        g, b, d)
end
function subs2(name, content)
    local rank, c, d = strsplit("|", content)
    return string.format("[%s] %s天赋排名:%s", name, doMap(c, false), rank)
end

function parseData(content)
    local rs = {};
    local ts, s, ow, det = strsplit("@", content)
    tinsert(rs, string.format("[WCL]英雄榜 收录时间 %s", ts));

    local score = tonumber(s)
    if score > 0 then
        local r, g, b = getScore(score);
        tinsert(rs, string.format("[WCL]平均分:  |cFF%02x%02x%02x%s|r", r, g, b, s));
    end
    if strlen(ow) > 0 then
        local rank, c, d = strsplit("|", ow)
        local rate = tonumber(rank)
        local r, g, b = getCor(rate);
        tinsert(rs, string.format("【 总排名 】:  |cFF%02x%02x%02x%s|r  天赋:  %s", r, g, b, rank, doMap(c, true)));
    end
    if strlen(det) > 0 then
        local a1, a2, a3 = strsplit("#", det)
        if a1 ~= nil then
            tinsert(rs, subs(a1));
        end
        if a2 ~= nil then
            tinsert(rs, subs(a2));
        end
        if a3 ~= nil then
            tinsert(rs, subs(a3));
        end
    end
    return rs;
end


function parseData2(name, content)
    local str = "";
    local rs = {};
    local ts, s, ow, det = strsplit("@", content)
    -- tinsert(rs, string.format("[WCL]英雄榜 收录时间 %s", ts));
    local score = tonumber(s)
    if score > 0 then
        tinsert(rs, string.format("[%s] WCL: %s", name, s));
    end
    if strlen(ow) > 0 then
        local rank, c, d = strsplit("|", ow)
        local rate = tonumber(rank)
        local r, g, b = getCor(rate);
        tinsert(rs, string.format("[%s] WCL DPS总排名:%s [%s]", name, rank, doMap(c, true)));
    end
    if strlen(det) > 0 then
        local a1, a2, a3 = strsplit("#", det)
        if a1 ~= nil then
            tinsert(rs, subs2(name, a1));
        end
        if a2 ~= nil then
            tinsert(rs, subs2(name, a2));
        end
        if a3 ~= nil then
            tinsert(rs, subs2(name, a3));
        end
    end
    return rs;
end

-- _G["parseWCL"] = function (content)
--     return parseData(content)
-- end

_G["parseWCL"] = function(name)
    local info = wclData[name]
    if info == nil then
        return nil;
    end
    return parseData2(name, info)
end