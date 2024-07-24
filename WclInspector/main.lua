-- https://github.com/sankooc/wclrank

GameTooltip:HookScript("OnTooltipSetUnit", function(self)
    local name, unit = self:GetUnit()
    if (not unit) then
        return
    end

    -- local guid = UnitGUID(unit)
    local text = {}
    local linesToAdd = {}

    local numLines = GameTooltip:NumLines()
    for i = 1, numLines do
        text[i] = _G["GameTooltipTextLeft" .. i]:GetText()
    end
    if (not text[1] or text[1] == "") then return end
    if (not text[2] or text[2] == "") then return end
    if (UnitIsPlayer(unit)) then
        local localizedClass, class = UnitClass(unit)

        if (string.find(text[1], name)) then
            text[1] = name
        end
        if (localizedClass and class) then
            local classc = (CUSTOM_CLASS_COLORS or RAID_CLASS_COLORS)[class]
            if (classc) then
                text[1] = string.format("|cFF%02x%02x%02x%s|r", classc.r * 255, classc.g * 255, classc.b * 255,
                    text[1])
                for i = 2, 3 do
                    if (text[i]) then
                        text[i] = string.gsub(text[i], localizedClass,
                            string.format("|cFF%02x%02x%02x%s|r", classc.r * 255, classc.g * 255, classc.b * 255,
                                localizedClass), 1)
                    end
                end
            end
        end
    end
    local n = 0
    for i=1,numLines do
        if (text[i] and text[i] ~= "") then
            n = n+1
            _G["GameTooltipTextLeft"..n]:SetText(text[i])
        end
    end
    local ins = getWCLinfo(name)
    if ins ~= nil then
        for _,v in ipairs(ins) do
            tinsert(linesToAdd, {v,0.4,0.4,0.3})
        end
    end
    for _,v in ipairs(linesToAdd) do
        if (n < numLines) then
            n = n+1
            local txt, r, g, b = unpack(v)
            _G["GameTooltipTextLeft"..n]:SetTextColor(r or NORMAL_FONT_COLOR.r, g or NORMAL_FONT_COLOR.g, b or NORMAL_FONT_COLOR.b)
            _G["GameTooltipTextLeft"..n]:SetText(txt)
        else
            self:AddLine(unpack(v))
        end
    end
    while (n < numLines) do
        n = n + 1
        _G["GameTooltipTextLeft"..n]:SetText()
        _G["GameTooltipTextRight"..n]:SetText()
        _G["GameTooltipTextLeft"..n]:Hide()
        _G["GameTooltipTextRight"..n]:Hide()
    end
    -- print(_G["GameTooltipTextLeft1"])
end)