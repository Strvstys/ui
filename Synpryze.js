local Flow = (function()
local protect_gui = (syn and syn.protect_gui) or (type(protectgui) == 'function' and protectgui) or function() end
local clone_ref = type(cloneref) == 'function' and cloneref or function(object) return object end

local function protected_host()
    local host = (type(gethui) == 'function' and gethui())
        or (game:GetService('RunService'):IsStudio() and game:GetService('Players').LocalPlayer
            and game:GetService('Players').LocalPlayer:FindFirstChildOfClass('PlayerGui'))
        or game:GetService('CoreGui')
    return clone_ref(host)
end

local function random_name()
    local chars, name = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', {}
    for _ = 1, 16 do
        local index = math.random(1, #chars)
        name[#name + 1] = string.sub(chars, index, index)
    end
    return table.concat(name)
end
local Players = game:GetService('Players')
local TweenService = game:GetService('TweenService')
local UserInputService = game:GetService('UserInputService')
local HttpService = game:GetService('HttpService')
local RunService = game:GetService('RunService')
local Lighting = game:GetService('Lighting')
local GuiService = game:GetService('GuiService')

local LocalPlayer = Players.LocalPlayer

local Flow = {
    Flags = {},
    Values = {},
    Connections = {}
}

local Sheet = 'rbxassetid://139960910065130'

local function sheet(x, y)
    return { Sheet, Vector2.new(x + 12, y + 12), Vector2.new(104, 104) }
end

local Icons = {
    skull = sheet(0, 0),
    person = sheet(128, 0),
    cloud = sheet(256, 0),
    move = sheet(384, 0),
    pencil = sheet(512, 0),
    trash = sheet(640, 0),
    search = sheet(768, 0),
    settings = sheet(896, 0),
    left = sheet(0, 128),
    down = sheet(128, 128),
    up = sheet(256, 128),
    keyboard = sheet(384, 128),
    eye = sheet(512, 128),
    shield = sheet(640, 128),
    crosshair = sheet(768, 128),
    bolt = sheet(896, 128),
    pointer = sheet(0, 256),
    ['eye-off'] = sheet(128, 256),
    unlock = sheet(256, 256),
    wand = sheet(384, 256),
    user = sheet(512, 256),
    flag = sheet(640, 256),
    rotate = sheet(768, 256),
    play = sheet(896, 256),
    ghost = sheet(0, 384),
    lightning = sheet(128, 384),
    run = sheet(256, 384),
    ['arrow-up'] = sheet(384, 384),
    sliders = sheet(512, 384),
    folder = sheet(640, 384),
    ball = sheet(768, 384),
    logo = { Sheet, Vector2.new(896, 384), Vector2.new(128, 128) },
}

Icons['shield-check'] = Icons['shield']
Icons['shield-half'] = Icons['shield']
Icons['file-cog'] = Icons['sliders']
Icons['visuals'] = Icons['eye']
Icons['user-lucide'] = Icons['person']
Icons['globe'] = Icons['rotate']
Icons['swords'] = Icons['crosshair']
Flow.Icons = Icons

local Theme = {
    Background = Color3.fromRGB(14, 14, 14),
    Top = Color3.fromRGB(22, 22, 22),
    TabActive = Color3.fromRGB(22, 22, 22),
    Module = Color3.fromRGB(21, 21, 21),
    ModuleOpen = Color3.fromRGB(34, 34, 34),
    IconBox = Color3.fromRGB(48, 48, 48),
    IconBoxIdle = Color3.fromRGB(27, 27, 27),
    Field = Color3.fromRGB(34, 34, 34),
    List = Color3.fromRGB(27, 27, 27),
    Search = Color3.fromRGB(27, 27, 27),
    SearchIcon = Color3.fromRGB(35, 35, 35),
    Track = Color3.fromRGB(34, 34, 34),
    Fill = Color3.fromRGB(147, 147, 147),
    ToggleOff = Color3.fromRGB(37, 37, 37),
    ToggleOn = Color3.fromRGB(140, 140, 140),
    Popup = Color3.fromRGB(20, 20, 20),
    KeybindsHeader = Color3.fromRGB(31, 31, 31),
    KeybindsBody = Color3.fromRGB(16, 16, 16),
    Tooltip = Color3.fromRGB(9, 9, 9),
    White = Color3.fromRGB(255, 255, 255),
    Text = Color3.fromRGB(134, 134, 134),
    Label = Color3.fromRGB(136, 136, 136),
    Value = Color3.fromRGB(112, 112, 112),
    Chip = Color3.fromRGB(175, 175, 175),
    Glyph = Color3.fromRGB(168, 168, 168),
    Placeholder = Color3.fromRGB(126, 126, 126),
    SearchGlyph = Color3.fromRGB(128, 128, 128),
    Gear = Color3.fromRGB(140, 140, 140),
    TooltipText = Color3.fromRGB(150, 150, 150),
    KeybindsText = Color3.fromRGB(110, 110, 110),
    Muted = Color3.fromRGB(110, 110, 110),
    Faded = Color3.fromRGB(66, 66, 66),
    Chevron = Color3.fromRGB(105, 105, 105)
}
Flow.Theme = Theme

local Text_Size = 12

local function font(weight)
    return Font.new('rbxasset://fonts/families/Montserrat.json', weight or Enum.FontWeight.SemiBold)
end

local function set_image(object, value)
    if type(value) == 'table' then
        object.Image = value[1]
        object.ImageRectOffset = value[2]
        object.ImageRectSize = value[3]
    else
        object.Image = value or ''
        object.ImageRectOffset = Vector2.zero
        object.ImageRectSize = Vector2.zero
    end
end

local function new(class, props, children)
    local object = Instance.new(class)

    for key, value in props or {} do
        if key == 'Image' then
            set_image(object, value)
        elseif key ~= 'Parent' then
            object[key] = value
        end
    end

    for _, child in children or {} do
        child.Parent = object
    end

    if props and props.Parent then
        object.Parent = props.Parent
    end

    return object
end

local function corner(radius)
    return new('UICorner', { CornerRadius = UDim.new(0, radius) })
end

local function round()
    return new('UICorner', { CornerRadius = UDim.new(0.5, 0) })
end

local function text(props)
    props.BackgroundTransparency = props.BackgroundTransparency or 1
    props.FontFace = props.FontFace or font()
    props.TextXAlignment = props.TextXAlignment or Enum.TextXAlignment.Left
    props.TextColor3 = props.TextColor3 or Theme.Text
    props.TextSize = props.TextSize or Text_Size

    return new('TextLabel', props)
end

local function icon(props)
    props.BackgroundTransparency = 1
    props.ScaleType = props.ScaleType or Enum.ScaleType.Fit

    return new('ImageLabel', props)
end

local function tween(object, goal, time)
    local animation = TweenService:Create(object, TweenInfo.new(time or 0.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), goal)
    animation:Play()

    return animation
end

local function connect(signal, callback)
    local connection = signal:Connect(callback)
    table.insert(Flow.Connections, connection)

    return connection
end

local function spawn_callback(callback, ...)
    if type(callback) ~= 'function' then
        return
    end

    local arguments = table.pack(...)

    task.spawn(function()
        local ok, err = pcall(callback, table.unpack(arguments, 1, arguments.n))

        if not ok then
            warn('[Flow] ' .. tostring(err))
        end
    end)
end

local function is_click(input)
    return input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch
end

local function drag_moves(started, input)
    if not started then
        return false
    end

    if started.UserInputType == Enum.UserInputType.Touch then
        return input == started
    end

    return input.UserInputType == Enum.UserInputType.MouseMovement
end

local function drag_ends(started, input)
    if not started then
        return false
    end

    if started.UserInputType == Enum.UserInputType.Touch then
        return input == started
    end

    return input.UserInputType == Enum.UserInputType.MouseButton1
end

local function screen_point(input)
    if input and input.UserInputType == Enum.UserInputType.Touch then
        return Vector2.new(input.Position.X, input.Position.Y) + GuiService:GetGuiInset()
    end

    return UserInputService:GetMouseLocation()
end

local function inside(object, point)
    local position, size = object.AbsolutePosition, object.AbsoluteSize
    return point.X >= position.X and point.X <= position.X + size.X and point.Y >= position.Y and point.Y <= position.Y + size.Y
end

local function bound_key(module)
    return rawget(module, 'Keybind')
end

local function key_name(key)
    if not key or key == Enum.KeyCode.Unknown then
        return 'None'
    end

    return key.Name
end

local Config_Folder = 'Click'
local Config_File = Config_Folder .. '/' .. tostring(game.GameId) .. '.lua'

function Flow:Load()
    local ok, data = pcall(function()
        if not isfile(Config_File) then
            return nil
        end

        return HttpService:JSONDecode(readfile(Config_File))
    end)

    if ok and type(data) == 'table' then
        self.Values = data
    end
end

function Flow:Save()
    pcall(function()
        if not isfolder(Config_Folder) then
            makefolder(Config_Folder)
        end

        writefile(Config_File, HttpService:JSONEncode(self.Values))
    end)
end

local Save_Queued = false

local function queue_save()
    if Save_Queued then
        return
    end

    Save_Queued = true

    task.delay(0.5, function()
        Save_Queued = false
        Flow:Save()
    end)
end

local function stored(flag, default)
    if flag and Flow.Values[flag] ~= nil then
        return Flow.Values[flag]
    end

    return default
end

local function store(flag, value)
    if not flag then
        return
    end

    Flow.Values[flag] = value
    queue_save()
end

local Window = {}
Window.__index = Window

local Tab = {}
Tab.__index = Tab

local Module = {}
Module.__index = Module

local function keyboard_icon(parent)
    local board = new('Frame', {
        Name = 'Keyboard',
        BackgroundColor3 = Theme.White,
        AnchorPoint = Vector2.new(0, 0.5),
        Position = UDim2.new(0, 12, 0.5, 0),
        Size = UDim2.fromOffset(15, 9),
        Parent = parent
    }, { corner(2) })

    for row = 0, 1 do
        for column = 0, 5 do
            new('Frame', {
                BackgroundColor3 = Theme.KeybindsHeader,
                BorderSizePixel = 0,
                Position = UDim2.fromOffset(2 + column * 2, 2 + row * 2),
                Size = UDim2.fromOffset(1, 1),
                Parent = board
            })
        end
    end

    new('Frame', {
        BackgroundColor3 = Theme.KeybindsHeader,
        BorderSizePixel = 0,
        Position = UDim2.fromOffset(4, 6),
        Size = UDim2.fromOffset(7, 1),
        Parent = board
    })

    return board
end

function Flow:Window(options)
    options = options or {}
    self:Load()

    local host = protected_host()
    local name = options.GuiName or random_name()

    local old = host:FindFirstChild(name)

    if old then
        old:Destroy()
    end

    local self_window = setmetatable({}, Window)
    self_window.Tabs = {}
    self_window.Modules = {}
    self_window.ToggleKey = options.ToggleKey or Enum.KeyCode.RightShift
    self_window.SettingsTab = options.SettingsTab or 'Settings'

    local gui = new('ScreenGui', {
        Name = name,
        ResetOnSpawn = false,
        IgnoreGuiInset = true,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
        DisplayOrder = 50,
        Parent = host
    })
    pcall(protect_gui, gui)
    self_window.Gui = gui

    local main = new('Frame', {
        Name = 'Main',
        Active = true,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.fromScale(0.5, 0.5),
        Size = UDim2.fromOffset(640, 355),
        BackgroundColor3 = Theme.Background,
        BackgroundTransparency = 0,
        BorderSizePixel = 0,
        ClipsDescendants = true,
        ZIndex = 1,
        Parent = gui
    }, {
        corner(10)
    })
    self_window.Main = main

    local overlay = new('Frame', {
        Name = 'Overlay',
        AnchorPoint = main.AnchorPoint,
        Position = main.Position,
        Size = main.Size,
        BackgroundTransparency = 1,
        ZIndex = 5,
        Parent = gui
    })
    self_window.Overlay = overlay

    local scale = new('UIScale', { Parent = main })
    local overlay_scale = new('UIScale', { Parent = overlay })

    function self_window.Ratio()
        local ratio = main.AbsoluteSize.X / 640
        return ratio > 0 and ratio or 1
    end

    function self_window.Local(object)
        local ratio = self_window.Ratio()
        return (object.AbsolutePosition - main.AbsolutePosition) / ratio, object.AbsoluteSize / ratio
    end

    local keybinds = new('Frame', {
        Name = 'Keybinds',
        Active = true,
        AnchorPoint = Vector2.new(1, 0),
        Size = UDim2.fromOffset(237, 0),
        AutomaticSize = Enum.AutomaticSize.Y,
        BackgroundColor3 = Theme.KeybindsBody,
        Visible = false,
        ZIndex = 2,
        Parent = gui
    }, {
        corner(9),
        new('UIListLayout', { SortOrder = Enum.SortOrder.LayoutOrder })
    })
    local keybinds_scale = new('UIScale', { Parent = keybinds })

    local keybinds_header = new('Frame', {
        Name = 'Header',
        Active = true,
        BackgroundColor3 = Theme.KeybindsHeader,
        Size = UDim2.new(1, 0, 0, 28),
        LayoutOrder = 1,
        Parent = keybinds
    }, {
        corner(9),
        new('Frame', {
            Name = 'Edge',
            BackgroundColor3 = Theme.KeybindsHeader,
            BorderSizePixel = 0,
            AnchorPoint = Vector2.new(0, 1),
            Position = UDim2.fromScale(0, 1),
            Size = UDim2.new(1, 0, 0, 9)
        })
    })

    keyboard_icon(keybinds_header)

    text({
        Name = 'Title',
        Text = 'Keybinds',
        FontFace = font(Enum.FontWeight.Bold),
        TextColor3 = Theme.White,
        Position = UDim2.fromOffset(35, 0),
        Size = UDim2.new(1, -35, 1, 0),
        Parent = keybinds_header
    })

    local keybinds_rows = new('Frame', {
        Name = 'Rows',
        BackgroundTransparency = 1,
        Size = UDim2.new(1, 0, 0, 0),
        AutomaticSize = Enum.AutomaticSize.Y,
        LayoutOrder = 2,
        Parent = keybinds
    }, {
        new('UIListLayout', { SortOrder = Enum.SortOrder.LayoutOrder }),
        new('UIPadding', { PaddingTop = UDim.new(0, 5), PaddingBottom = UDim.new(0, 4), PaddingLeft = UDim.new(0, 12), PaddingRight = UDim.new(0, 13) })
    })
    self_window.KeybindsFrame = keybinds

    local keybinds_moved = false

    local function place_keybinds()
        if keybinds_moved then
            return
        end

        local s = scale.Scale
        local position = main.Position
        local x_offset = position.X.Offset - math.floor((320 + 19) * s + 0.5)

        local screen = gui.AbsoluteSize.X

        if screen > 0 then
            local centre = screen * position.X.Scale + position.X.Offset
            local width = 237 * s

            if centre - (320 + 19) * s - width < 8 then
                if centre + (320 + 19) * s + width <= screen - 8 then
                    x_offset = position.X.Offset + math.floor((320 + 19 + 237) * s + 0.5)
                else
                    x_offset = math.floor(8 + width + 0.5) - math.floor(screen * position.X.Scale + 0.5)
                end
            end
        end

        keybinds.Position = UDim2.new(position.X.Scale, x_offset, position.Y.Scale, position.Y.Offset - math.floor(177.5 * s + 0.5))
    end

    function self_window:RefreshKeybinds()
        for _, child in keybinds_rows:GetChildren() do
            if child:IsA('Frame') then
                child:Destroy()
            end
        end

        local count = 0

        for _, module in self.Modules do
            if bound_key(module) then
                count += 1

                local row = new('Frame', {
                    Name = module.Name,
                    BackgroundTransparency = 1,
                    Size = UDim2.new(1, 0, 0, 21),
                    LayoutOrder = count,
                    Parent = keybinds_rows
                })

                text({
                    Text = module.Name,
                    TextColor3 = Theme.KeybindsText,
                    TextTruncate = Enum.TextTruncate.AtEnd,
                    Size = UDim2.new(1, -70, 1, 0),
                    Parent = row
                })

                text({
                    Text = key_name(bound_key(module)),
                    TextColor3 = Theme.KeybindsText,
                    TextXAlignment = Enum.TextXAlignment.Right,
                    AnchorPoint = Vector2.new(1, 0),
                    Position = UDim2.fromScale(1, 0),
                    Size = UDim2.new(0, 70, 1, 0),
                    Parent = row
                })
            end
        end

        keybinds.Visible = options.Keybinds ~= false and count > 0 and UserInputService.KeyboardEnabled
    end

    local function fit()
        local camera = workspace.CurrentCamera
        local viewport = camera and camera.ViewportSize or Vector2.new(1280, 720)
        local s = math.min(options.Scale or 1, (viewport.X - 20) / 640, (viewport.Y - 20) / 355)
        self_window.Fit = s
        scale.Scale = s
        overlay_scale.Scale = s
        keybinds_scale.Scale = s
        place_keybinds()
    end

    fit()

    if workspace.CurrentCamera then
        connect(workspace.CurrentCamera:GetPropertyChangedSignal('ViewportSize'), fit)
    end

    connect(main:GetPropertyChangedSignal('Position'), function()
        overlay.Position = main.Position
        place_keybinds()
    end)

    local top = new('Frame', {
        Name = 'Top',
        Active = true,
        BackgroundColor3 = Theme.Top,
        Position = UDim2.fromOffset(8, 7),
        Size = UDim2.new(1, -16, 0, 26),
        Parent = main
    }, { corner(7) })

    local logo = new('ImageLabel', {
        Name = 'Logo',
        BackgroundTransparency = 1,
        AnchorPoint = Vector2.new(0, 0.5),
        Position = UDim2.new(0, 7, 0.5, 0),
        Size = UDim2.fromOffset(15, 15),
        ScaleType = Enum.ScaleType.Crop,
        Image = '',
        Parent = top
    }, { round() })
    self_window.Logo = logo

    if options.Logo then
        if type(options.Logo) == 'table' then

            logo.Image = options.Logo[1]
            logo.ImageRectOffset = options.Logo[2]
            logo.ImageRectSize = options.Logo[3]
        else
            local id = tostring(options.Logo)
            logo.Image = string.match(id, '^%d+$') and ('rbxassetid://' .. id) or id
        end

        logo.ScaleType = Enum.ScaleType.Fit

        if logo:FindFirstChildOfClass('UICorner') then
            logo:FindFirstChildOfClass('UICorner'):Destroy()
        end
    elseif LocalPlayer then
        task.spawn(function()
            local ok, image = pcall(function()
                return Players:GetUserThumbnailAsync(LocalPlayer.UserId, Enum.ThumbnailType.HeadShot, Enum.ThumbnailSize.Size48x48)
            end)

            if ok and image and logo.Parent then
                logo.Image = image
            end
        end)
    end

    text({
        Name = 'Title',
        Text = options.Title or 'Flow',
        FontFace = font(Enum.FontWeight.Bold),
        TextColor3 = Theme.White,
        Position = UDim2.fromOffset(28, 0),
        Size = UDim2.new(0, 300, 1, 0),
        Parent = top
    })

    local search = new('Frame', {
        Name = 'Search',
        AnchorPoint = Vector2.new(1, 0.5),
        Position = UDim2.new(1, -25, 0.5, 0),
        Size = UDim2.fromOffset(64, 18),
        BackgroundColor3 = Theme.Search,
        ClipsDescendants = true,
        Parent = top
    }, { corner(4) })

    local search_box = new('TextBox', {
        Name = 'Box',
        BackgroundTransparency = 1,
        Position = UDim2.fromOffset(8, 0),
        Size = UDim2.new(1, -27, 1, 0),
        ClearTextOnFocus = false,
        Text = '',
        PlaceholderText = 'Search',
        PlaceholderColor3 = Theme.Placeholder,
        TextColor3 = Theme.White,
        FontFace = font(),
        TextSize = 11,
        TextXAlignment = Enum.TextXAlignment.Left,
        Parent = search
    })

    local search_icon = new('Frame', {
        Name = 'Icon',
        AnchorPoint = Vector2.new(1, 0.5),
        Position = UDim2.new(1, 0, 0.5, 0),
        Size = UDim2.fromOffset(19, 18),
        BackgroundColor3 = Theme.SearchIcon,
        Parent = search
    }, { corner(4) })

    icon({
        Image = Icons.search,
        ImageColor3 = Theme.SearchGlyph,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.fromScale(0.5, 0.5),
        Size = UDim2.fromOffset(9, 9),
        Parent = search_icon
    })

    local function grow_search(focused)
        local wide = focused or search_box.Text ~= ''
        tween(search, { Size = UDim2.fromOffset(wide and 150 or 64, 18) }, 0.2)
    end

    connect(search_box.Focused, function()
        grow_search(true)
    end)

    connect(search_box.FocusLost, function()
        grow_search(false)
    end)

    connect(search_box:GetPropertyChangedSignal('Text'), function()
        self_window:Filter(search_box.Text)
    end)

    local gear = new('ImageButton', {
        Name = 'Settings',
        BackgroundTransparency = 1,
        AutoButtonColor = false,
        Image = Icons.settings,
        ImageColor3 = Theme.Gear,
        ScaleType = Enum.ScaleType.Fit,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(1, -13, 0.5, 0),
        Size = UDim2.fromOffset(9, 9),
        Parent = top
    })

    connect(gear.MouseButton1Click, function()
        for _, tab in self_window.Tabs do
            if tab.Name == self_window.SettingsTab then
                self_window:Select(tab)
                return
            end
        end
    end)

    connect(gear.MouseEnter, function()
        tween(gear, { ImageColor3 = Theme.White }, 0.15)
    end)

    connect(gear.MouseLeave, function()
        tween(gear, { ImageColor3 = Theme.Gear }, 0.15)
    end)

    local sidebar = new('Frame', {
        Name = 'Tabs',
        BackgroundTransparency = 1,
        Position = UDim2.fromOffset(8, 36),
        Size = UDim2.new(0, 138, 1, -44),
        Parent = main
    }, {
        new('UIListLayout', { Padding = UDim.new(0, 5), SortOrder = Enum.SortOrder.LayoutOrder })
    })
    self_window.Sidebar = sidebar

    local pages = new('Frame', {
        Name = 'Pages',
        BackgroundTransparency = 1,
        Position = UDim2.fromOffset(152, 36),
        Size = UDim2.new(1, -160, 1, -44),
        Parent = main
    })
    self_window.Pages = pages

    local tooltip = text({
        Name = 'Tooltip',
        Text = '',
        BackgroundColor3 = Theme.Tooltip,
        BackgroundTransparency = 1,
        TextColor3 = Theme.TooltipText,
        TextTransparency = 1,
        AutomaticSize = Enum.AutomaticSize.X,
        Size = UDim2.fromOffset(0, 20),
        Visible = false,
        ZIndex = 10,
        Parent = overlay
    })
    corner(4).Parent = tooltip
    new('UIPadding', { PaddingLeft = UDim.new(0, 9), PaddingRight = UDim.new(0, 6), Parent = tooltip })

    local tooltip_anchor = nil

    function self_window:ShowTooltip(value, anchor)
        if not value or value == '' then
            return
        end

        tooltip_anchor = anchor
        local position = self.Local(anchor)
        tooltip.Text = tostring(value)
        tooltip.Position = UDim2.fromOffset(math.floor(position.X + 100 + 0.5), math.floor(position.Y - 5 + 0.5))
        tooltip.Visible = true
        tween(tooltip, { BackgroundTransparency = 0.5, TextTransparency = 0 }, 0.15)
    end

    function self_window:HideTooltip(anchor)
        if anchor and anchor ~= tooltip_anchor then
            return
        end

        tooltip_anchor = nil
        tooltip.Visible = false
        tooltip.BackgroundTransparency = 1
        tooltip.TextTransparency = 1
    end

    local popup = new('Frame', {
        Name = 'ColorPicker',
        Active = true,
        BackgroundColor3 = Theme.Popup,
        Size = UDim2.fromOffset(147, 96),
        Visible = false,
        ZIndex = 8,
        Parent = overlay
    }, { corner(6) })

    local sv = new('TextButton', {
        Name = 'SV',
        Text = '',
        AutoButtonColor = false,
        BackgroundColor3 = Color3.fromHSV(0, 1, 1),
        BorderSizePixel = 0,
        Position = UDim2.fromOffset(7, 7),
        Size = UDim2.fromOffset(133, 72),
        ZIndex = 8,
        Parent = popup
    }, { corner(2) })

    new('Frame', {
        Name = 'White',
        BackgroundColor3 = Theme.White,
        BorderSizePixel = 0,
        Size = UDim2.fromScale(1, 1),
        ZIndex = 8,
        Parent = sv
    }, {
        corner(2),
        new('UIGradient', { Transparency = NumberSequence.new(0, 1) })
    })

    new('Frame', {
        Name = 'Black',
        BackgroundColor3 = Color3.new(0, 0, 0),
        BorderSizePixel = 0,
        Size = UDim2.fromScale(1, 1),
        ZIndex = 8,
        Parent = sv
    }, {
        corner(2),
        new('UIGradient', { Rotation = 90, Transparency = NumberSequence.new(1, 0) })
    })

    local sv_knob = new('Frame', {
        Name = 'Knob',
        BackgroundTransparency = 1,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Size = UDim2.fromOffset(8, 8),
        ZIndex = 9,
        Parent = sv
    }, {
        round(),
        new('UIStroke', { Color = Theme.White, Thickness = 1 })
    })

    local hue_bar = new('TextButton', {
        Name = 'Hue',
        Text = '',
        AutoButtonColor = false,
        BackgroundColor3 = Theme.White,
        BorderSizePixel = 0,
        Position = UDim2.fromOffset(7, 83),
        Size = UDim2.fromOffset(133, 6),
        ZIndex = 8,
        Parent = popup
    }, {
        round(),
        new('UIGradient', {
            Color = ColorSequence.new({
                ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 0, 0)),
                ColorSequenceKeypoint.new(1 / 6, Color3.fromRGB(255, 255, 0)),
                ColorSequenceKeypoint.new(2 / 6, Color3.fromRGB(0, 255, 0)),
                ColorSequenceKeypoint.new(3 / 6, Color3.fromRGB(0, 255, 255)),
                ColorSequenceKeypoint.new(4 / 6, Color3.fromRGB(0, 0, 255)),
                ColorSequenceKeypoint.new(5 / 6, Color3.fromRGB(255, 0, 255)),
                ColorSequenceKeypoint.new(1, Color3.fromRGB(255, 0, 0))
            })
        })
    })

    local hue_knob = new('Frame', {
        Name = 'Knob',
        BackgroundColor3 = Color3.fromHSV(0, 1, 1),
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.fromOffset(3, 3),
        Size = UDim2.fromOffset(8, 8),
        ZIndex = 9,
        Parent = hue_bar
    }, {
        round(),
        new('UIStroke', { Color = Theme.White, Thickness = 1 })
    })

    local picker = { Target = nil, Drag = nil }

    local function paint_picker()
        local target = picker.Target

        if not target then
            return
        end

        local h, s, v = target.H, target.S, target.V
        sv.BackgroundColor3 = Color3.fromHSV(h, 1, 1)
        hue_knob.BackgroundColor3 = Color3.fromHSV(h, 1, 1)
        sv_knob.Position = UDim2.fromOffset(math.clamp(math.floor(s * 133 + 0.5), 2, 131), math.clamp(math.floor((1 - v) * 72 + 0.5), 2, 70))
        hue_knob.Position = UDim2.fromOffset(math.clamp(math.floor(h * 133 + 0.5), 3, 130), 3)
    end

    function self_window:OpenPicker(target)
        if picker.Target == target and popup.Visible then
            self:ClosePicker()
            return
        end

        picker.Target = target
        local position = self.Local(target.Swatch)
        popup.Position = UDim2.fromOffset(646, math.floor(position.Y + 0.5))
        paint_picker()
        popup.Visible = true
    end

    function self_window:ClosePicker()
        picker.Target = nil
        picker.Drag = nil
        picker.Input = nil
        popup.Visible = false
    end

    local function drag_picker(input)
        local target = picker.Target

        if not target or not picker.Drag then
            return
        end

        local mouse = screen_point(input)

        if picker.Drag == 'sv' then
            local position, size = sv.AbsolutePosition, sv.AbsoluteSize
            target:Apply(target.H, math.clamp((mouse.X - position.X) / math.max(size.X, 1), 0, 1), 1 - math.clamp((mouse.Y - position.Y) / math.max(size.Y, 1), 0, 1))
        else
            local position, size = hue_bar.AbsolutePosition, hue_bar.AbsoluteSize
            target:Apply(math.clamp((mouse.X - position.X) / math.max(size.X, 1), 0, 0.999), target.S, target.V)
        end

        paint_picker()
    end

    self_window.PaintPicker = function(target)
        if picker.Target == target then
            paint_picker()
        end
    end

    connect(sv.InputBegan, function(input)
        if is_click(input) then
            picker.Drag = 'sv'
            picker.Input = input
            drag_picker(input)
        end
    end)

    connect(hue_bar.InputBegan, function(input)
        if is_click(input) then
            picker.Drag = 'hue'
            picker.Input = input
            drag_picker(input)
        end
    end)

    local dragging, drag_start, start_position
    local keybinds_drag, keybinds_start, keybinds_position

    connect(top.InputBegan, function(input)
        if is_click(input) then
            dragging = input
            drag_start = input.Position
            start_position = main.Position
        end
    end)

    connect(keybinds_header.InputBegan, function(input)
        if is_click(input) then
            keybinds_drag = input
            keybinds_start = input.Position
            keybinds_position = keybinds.Position
        end
    end)

    connect(UserInputService.InputChanged, function(input)
        if input.UserInputType ~= Enum.UserInputType.MouseMovement and input.UserInputType ~= Enum.UserInputType.Touch then
            return
        end

        if drag_moves(dragging, input) then
            local delta = input.Position - drag_start
            main.Position = UDim2.new(start_position.X.Scale, start_position.X.Offset + delta.X, start_position.Y.Scale, start_position.Y.Offset + delta.Y)
        end

        if drag_moves(keybinds_drag, input) then
            local delta = input.Position - keybinds_start
            keybinds_moved = true
            keybinds.Position = UDim2.new(keybinds_position.X.Scale, keybinds_position.X.Offset + delta.X, keybinds_position.Y.Scale, keybinds_position.Y.Offset + delta.Y)
        end

        if picker.Drag and drag_moves(picker.Input, input) then
            drag_picker(input)
        end
    end)

    connect(UserInputService.InputEnded, function(input)
        if drag_ends(dragging, input) then
            dragging = nil
        end

        if drag_ends(keybinds_drag, input) then
            keybinds_drag = nil
        end

        if drag_ends(picker.Input, input) then
            picker.Drag = nil
            picker.Input = nil
        end
    end)

    connect(UserInputService.InputBegan, function(input, processed)

        local binding = self_window.Binding

        if binding then
            if is_click(input) then
                local point = screen_point(input)
                local hit = false

                for _, target in binding.BindTargets or {} do
                    if target.Visible and inside(target, point) then
                        hit = true
                    end
                end

                if not hit then
                    self_window:CancelBinding()
                end
            elseif input.UserInputType == Enum.UserInputType.Keyboard then
                if UserInputService:GetFocusedTextBox() then
                    return
                end

                if input.KeyCode == self_window.ToggleKey and not binding.MenuKey then
                    self_window:CancelBinding()
                else
                    self_window.Binding = nil

                    if input.KeyCode == Enum.KeyCode.Escape then
                        binding:CancelBinding()
                    elseif input.KeyCode == Enum.KeyCode.Backspace or input.KeyCode == Enum.KeyCode.Delete then
                        binding:SetKeybind(nil)
                    else
                        binding:SetKeybind(input.KeyCode)
                    end

                    return
                end
            else
                return
            end
        end

        if is_click(input) and popup.Visible and picker.Target then
            local mouse = UserInputService:GetMouseLocation()

            if not inside(popup, mouse) and not inside(picker.Target.Swatch, mouse) then
                self_window:ClosePicker()
            end
        end

        if processed or UserInputService:GetFocusedTextBox() then
            return
        end

        if input.KeyCode == self_window.ToggleKey then
            self_window:SetVisible(not self_window.Visible)
            return
        end

        if input.KeyCode == Enum.KeyCode.Unknown then
            return
        end

        for _, module in self_window.Modules do
            if bound_key(module) == input.KeyCode then
                module:Set(not module.Value)
            end
        end
    end)

    connect(UserInputService.TextBoxFocused, function()
        self_window:CancelBinding()
    end)

    local blur, tint

    if options.Blur then
        blur = new('BlurEffect', { Name = 'FlowBlur', Size = 0, Parent = Lighting })
        tint = new('ColorCorrectionEffect', { Name = 'FlowTint', Saturation = 0, Brightness = 0, Parent = Lighting })
    end

    local scales = { scale, overlay_scale, keybinds_scale }
    local show_token = 0
    self_window.Visible = true

    local function backdrop(on, time)
        if blur then
            local info = TweenInfo.new(time, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
            TweenService:Create(blur, info, { Size = on and 20 or 0 }):Play()
            TweenService:Create(tint, info, { Saturation = on and -1 or 0, Brightness = on and -0.1 or 0 }):Play()
        end
    end

    function self_window.Show(_, state)
        state = state and true or false
        self_window.Visible = state
        show_token += 1
        local token = show_token
        local target = self_window.Fit or scale.Scale

        if state then
            gui.Enabled = true

            for _, s in scales do
                s.Scale = target * 0.94
                TweenService:Create(s, TweenInfo.new(0.3, Enum.EasingStyle.Quint, Enum.EasingDirection.Out), { Scale = target }):Play()
            end

            backdrop(true, 0.3)
        else
            for _, s in scales do
                TweenService:Create(s, TweenInfo.new(0.16, Enum.EasingStyle.Quad, Enum.EasingDirection.In), { Scale = target * 0.94 }):Play()
            end

            backdrop(false, 0.2)

            task.delay(0.16, function()
                if show_token == token and gui.Parent then
                    gui.Enabled = false

                    for _, s in scales do
                        s.Scale = target
                    end
                end
            end)
        end
    end

    task.defer(backdrop, true, 0.4)

    connect(gui:GetPropertyChangedSignal('Enabled'), function()
        if blur then
            blur.Enabled = gui.Enabled
            tint.Enabled = gui.Enabled
        end

        if not gui.Enabled then
            self_window:HideTooltip()
            self_window:ClosePicker()

            self_window:CancelBinding()
        end
    end)

    connect(gui.Destroying, function()
        if blur then
            blur:Destroy()
            tint:Destroy()
        end

        for _, connection in Flow.Connections do
            connection:Disconnect()
        end

        table.clear(Flow.Connections)
    end)

    return self_window
end

function Window:BeginBinding(binder)
    if self.Binding and self.Binding ~= binder then
        self:CancelBinding()
    end

    self.Binding = binder
    self.BindToken = (self.BindToken or 0) + 1
    local token = self.BindToken

    task.delay(5, function()
        if self.Binding == binder and self.BindToken == token then
            self:CancelBinding()
        end
    end)
end

function Window:CancelBinding()
    local binding = self.Binding

    if binding then
        self.Binding = nil
        binding:CancelBinding()
    end
end

function Window:Filter(query)
    query = string.lower(query or '')
    self:CancelBinding()

    for _, tab in self.Tabs do
        for _, module in tab.Modules do
            module.Frame.Visible = query == '' or string.find(string.lower(module.Name), query, 1, true) ~= nil
        end
    end
end

function Window:SetVisible(state)
    if self.Show then
        self:Show(state)
    else
        self.Gui.Enabled = state
    end
end

function Window:Destroy()
    self.Gui:Destroy()
end

function Window:Tab(options)
    local tab = setmetatable({}, Tab)
    tab.Window = self
    tab.Name = options.Name
    tab.Modules = {}

    local button = new('TextButton', {
        Name = options.Name,
        Text = '',
        AutoButtonColor = false,
        BackgroundColor3 = Theme.TabActive,
        BackgroundTransparency = 1,
        Size = UDim2.new(1, 0, 0, 29),
        LayoutOrder = #self.Tabs + 1,
        Parent = self.Sidebar
    }, { corner(6) })

    local tab_icon = icon({
        Image = Icons[options.Icon] or options.Icon or '',
        ImageColor3 = Theme.Muted,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(0, 18, 0.5, 0),
        Size = UDim2.fromOffset(13, 13),
        Parent = button
    })

    local label = text({
        Text = options.Name,
        TextColor3 = Theme.Muted,
        Position = UDim2.fromOffset(30, 0),
        Size = UDim2.new(1, -30, 1, 0),
        Parent = button
    })

    local page = new('Frame', {
        Name = options.Name,
        BackgroundTransparency = 1,
        Size = UDim2.fromScale(1, 1),
        Visible = false,
        Parent = self.Pages
    })

    local function column(index)
        local scroll = new('ScrollingFrame', {
            Name = index == 1 and 'Left' or 'Right',
            BackgroundTransparency = 1,
            BorderSizePixel = 0,
            Position = UDim2.new(index == 1 and 0 or 0.5, index == 1 and 0 or 3, 0, 0),
            Size = UDim2.new(0.5, -3, 1, 0),
            CanvasSize = UDim2.new(),
            AutomaticCanvasSize = Enum.AutomaticSize.Y,
            ScrollBarThickness = 0,
            ScrollingDirection = Enum.ScrollingDirection.Y,
            Parent = page
        }, {
            new('UIListLayout', { Padding = UDim.new(0, 5), SortOrder = Enum.SortOrder.LayoutOrder }),
            new('UIPadding', { PaddingBottom = UDim.new(0, 8) })
        })

        return scroll
    end

    tab.Left = column(1)
    tab.Right = column(2)
    tab.Page = page
    tab.Button = button

    function tab.Paint(active)
        tween(button, { BackgroundTransparency = active and 0 or 1 }, 0.2)
        tween(label, { TextColor3 = active and Theme.White or Theme.Muted }, 0.2)
        tween(tab_icon, { ImageColor3 = active and Theme.White or Theme.Muted }, 0.2)
    end

    connect(button.MouseButton1Click, function()
        self:Select(tab)
    end)

    connect(button.MouseEnter, function()
        if self.Current ~= tab then
            tween(label, { TextColor3 = Color3.fromRGB(170, 170, 170) }, 0.15)
        end
    end)

    connect(button.MouseLeave, function()
        if self.Current ~= tab then
            tween(label, { TextColor3 = Theme.Muted }, 0.15)
        end
    end)

    table.insert(self.Tabs, tab)

    if #self.Tabs == 1 then
        self:Select(tab)
    end

    return tab
end

function Window:Select(tab)
    if type(tab) == 'string' then
        for _, value in self.Tabs do
            if value.Name == tab then
                tab = value
            end
        end
    end

    for _, value in self.Tabs do
        value.Page.Visible = value == tab
        value.Paint(value == tab)
    end

    if self.Current and self.Current ~= tab and type(tab) == 'table' then
        tab.Page.Position = UDim2.fromOffset(0, 10)
        TweenService:Create(tab.Page, TweenInfo.new(0.25, Enum.EasingStyle.Quint, Enum.EasingDirection.Out), { Position = UDim2.new() }):Play()
    end

    if self.Current ~= tab then
        self:HideTooltip()
        self:ClosePicker()
        self:CancelBinding()
    end

    self.Current = tab
end

local Header_Height = 29

function Tab:Module(options)
    local window = self.Window
    local module = setmetatable({}, Module)
    module.Tab = self
    module.Window = window
    module.Name = options.Name
    module.Flag = options.Flag
    module.Callback = options.Callback
    module.Description = options.Description

    module.Bindable = options.Bindable ~= false and UserInputService.KeyboardEnabled
    module.Expanded = false
    module.Order = 0

    local parent = (options.Side == 'Right' or options.Side == 2) and self.Right or self.Left

    local frame = new('Frame', {
        Name = options.Name,
        BackgroundColor3 = Theme.Module,
        Size = UDim2.new(1, 0, 0, Header_Height),
        ClipsDescendants = true,
        LayoutOrder = options.Order or #self.Modules + 1,
        Parent = parent
    }, { corner(6) })
    module.Frame = frame

    local header = new('TextButton', {
        Name = 'Header',
        Text = '',
        AutoButtonColor = false,
        BackgroundColor3 = Theme.ModuleOpen,
        BackgroundTransparency = 1,
        Size = UDim2.new(1, 0, 0, Header_Height),
        Parent = frame
    }, { corner(6) })

    local header_edge = new('Frame', {
        Name = 'Edge',
        BackgroundColor3 = Theme.ModuleOpen,
        BackgroundTransparency = 1,
        BorderSizePixel = 0,
        AnchorPoint = Vector2.new(0, 1),
        Position = UDim2.fromScale(0, 1),
        Size = UDim2.new(1, 0, 0, 6),
        ZIndex = 0,
        Parent = header
    })

    local lead = new('Frame', {
        Name = 'Lead',
        BackgroundTransparency = 1,
        Size = UDim2.new(1, -34, 1, 0),
        ClipsDescendants = true,
        ZIndex = 2,
        Parent = header
    }, {
        new('UIPadding', { PaddingLeft = UDim.new(0, 5) }),
        new('UIListLayout', {
            FillDirection = Enum.FillDirection.Horizontal,
            VerticalAlignment = Enum.VerticalAlignment.Center,
            SortOrder = Enum.SortOrder.LayoutOrder,
            Padding = UDim.new(0, 6)
        })
    })

    local box = new('TextButton', {
        Name = 'Icon',
        Text = '',
        AutoButtonColor = false,
        BackgroundColor3 = Theme.IconBoxIdle,
        Size = UDim2.fromOffset(20, 20),
        LayoutOrder = 1,
        ZIndex = 2,
        Parent = lead
    }, { corner(4) })

    local glyph = icon({
        Image = Icons[options.Icon or 'pencil'] or options.Icon,
        ImageColor3 = Theme.Glyph,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.fromScale(0.5, 0.5),
        Size = UDim2.fromOffset(11, 11),
        ZIndex = 2,
        Parent = box
    })

    local chip = new('TextButton', {
        Name = 'Key',
        Text = '',
        AutoButtonColor = false,
        BackgroundColor3 = Theme.IconBoxIdle,
        FontFace = font(),
        TextSize = Text_Size,
        TextColor3 = Theme.Chip,
        TextXAlignment = Enum.TextXAlignment.Center,
        Size = UDim2.fromOffset(20, 20),
        AutomaticSize = Enum.AutomaticSize.X,
        Visible = false,
        LayoutOrder = 2,
        ZIndex = 2,
        Parent = lead
    }, {
        corner(4),
        new('UIPadding', { PaddingLeft = UDim.new(0, 7), PaddingRight = UDim.new(0, 7) })
    })

    local label = text({
        Name = 'Title',
        Text = options.Name,
        Size = UDim2.fromScale(0, 1),
        AutomaticSize = Enum.AutomaticSize.X,
        LayoutOrder = 3,
        ZIndex = 2,
        Parent = lead
    })

    local chevron = icon({
        Image = Icons.left,
        ImageColor3 = Theme.Chevron,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(1, -15, 0.5, 0),
        Size = UDim2.fromOffset(13, 13),
        ZIndex = 2,
        Parent = header
    })

    local content = new('Frame', {
        Name = 'Content',
        BackgroundTransparency = 1,
        Position = UDim2.fromOffset(0, Header_Height),
        Size = UDim2.new(1, 0, 0, 0),
        AutomaticSize = Enum.AutomaticSize.Y,
        Parent = frame
    }, {
        new('UIListLayout', { Padding = UDim.new(0, 0), SortOrder = Enum.SortOrder.LayoutOrder }),
        new('UIPadding', { PaddingLeft = UDim.new(0, 10), PaddingRight = UDim.new(0, 11), PaddingTop = UDim.new(0, 4), PaddingBottom = UDim.new(0, 7) })
    })
    module.Content = content

    local layout = content:FindFirstChildOfClass('UIListLayout')

    local function content_height()
        return math.floor(layout.AbsoluteContentSize.Y / window.Ratio() + 0.5) + 11
    end

    function module.Resize(instant)
        local goal = UDim2.new(1, 0, 0, module.Expanded and (Header_Height + content_height()) or Header_Height)

        if instant then
            frame.Size = goal
        else
            tween(frame, { Size = goal }, 0.25)
        end
    end

    connect(layout:GetPropertyChangedSignal('AbsoluteContentSize'), function()
        if module.Expanded then
            module.Resize(true)
        end
    end)

    local function paint()
        local on = module.Value
        local lit = module.Expanded or on
        local waiting = window.Binding == module
        tween(header, { BackgroundTransparency = module.Expanded and 0 or 1 }, 0.2)
        tween(header_edge, { BackgroundTransparency = module.Expanded and 0 or 1 }, 0.2)
        tween(label, { TextColor3 = on and Theme.White or Theme.Text }, 0.2)
        tween(glyph, { ImageColor3 = on and Theme.White or Theme.Glyph }, 0.2)
        tween(box, { BackgroundColor3 = lit and Theme.IconBox or Theme.IconBoxIdle }, 0.2)
        tween(chip, { BackgroundColor3 = lit and Theme.IconBox or Theme.IconBoxIdle }, 0.2)

        chip.Visible = bound_key(module) ~= nil or waiting
        box.Visible = not chip.Visible
        chip.Text = waiting and '...' or key_name(bound_key(module))

        local open = module.Expanded
        set_image(chevron, open and Icons.down or Icons.left)
        chevron.Size = open and UDim2.fromOffset(11, 11) or UDim2.fromOffset(13, 13)
    end
    module.Paint = paint

    function module:SetExpanded(state)
        window:CancelBinding()
        self.Expanded = state and true or false
        paint()
        self.Resize(false)

        if not self.Expanded then
            window:ClosePicker()
        end
    end

    function module:Set(state, silent)
        self.Value = state and true or false
        store(self.Flag, self.Value)
        paint()

        if not silent then
            spawn_callback(self.Callback, self.Value)
        end
    end

    function module:Get()
        return self.Value
    end

    function module:SetKeybind(key, silent)
        if key == Enum.KeyCode.Unknown or typeof(key) ~= 'EnumItem' then
            key = nil
        end

        local changed = key ~= bound_key(self)
        rawset(self, 'Keybind', key)

        if window.Binding == self then
            window.Binding = nil
        end

        paint()
        window:RefreshKeybinds()

        if changed and not silent then
            spawn_callback(options.KeybindChanged, key)
        end
    end

    local function start_binding()
        if not module.Bindable then
            module:Set(not module.Value)
            return
        end

        window:BeginBinding(module)
        paint()
    end

    module.BindTargets = { box, chip }

    function module:CancelBinding()
        paint()
    end

    connect(box.MouseButton1Click, start_binding)
    connect(chip.MouseButton1Click, start_binding)

    connect(header.MouseButton1Click, function()
        local mouse = UserInputService:GetMouseLocation()
        local x = (mouse.X - header.AbsolutePosition.X) / window.Ratio()

        if x > frame.AbsoluteSize.X / window.Ratio() - 32 then
            module:SetExpanded(not module.Expanded)
        else
            module:Set(not module.Value)
        end
    end)

    connect(header.MouseButton2Click, function()
        module:SetExpanded(not module.Expanded)
    end)

    connect(header.MouseEnter, function()
        window:ShowTooltip(module.Description, header)
    end)

    connect(header.MouseLeave, function()
        window:HideTooltip(header)
    end)

    if module.Flag then
        Flow.Flags[module.Flag] = module
    end

    table.insert(self.Modules, module)
    table.insert(window.Modules, module)

    module.Value = stored(module.Flag, options.Default == true)
    module:SetKeybind(options.Keybind, true)

    if module.Value then
        spawn_callback(module.Callback, true)
    end

    return module
end

local function next_order(module)
    module.Order += 1
    return module.Order
end

local function field_label(parent, name, order)
    return text({
        Text = name,
        TextColor3 = Theme.Label,
        Size = UDim2.new(1, 0, 0, 17),
        LayoutOrder = order,
        Parent = parent
    })
end

function Module:Dropdown(options)
    local dropdown = { Options = options.Options or {}, Flag = options.Flag, Multi = options.Multi }
    local order = next_order(self)

    local holder = new('Frame', {
        Name = options.Name,
        BackgroundTransparency = 1,
        Size = UDim2.new(1, 0, 0, 0),
        AutomaticSize = Enum.AutomaticSize.Y,
        LayoutOrder = order,
        Parent = self.Content
    }, {
        new('UIListLayout', { SortOrder = Enum.SortOrder.LayoutOrder }),
        new('UIPadding', { PaddingBottom = UDim.new(0, 5) })
    })

    field_label(holder, options.Name, 1)

    local field = new('TextButton', {
        Name = 'Field',
        Text = '',
        AutoButtonColor = false,
        BackgroundColor3 = Theme.Field,
        Size = UDim2.new(1, 0, 0, 18),
        LayoutOrder = 2,
        ZIndex = 2,
        Parent = holder
    }, { corner(5) })

    local field_edge = new('Frame', {
        Name = 'Edge',
        BackgroundColor3 = Theme.Field,
        BorderSizePixel = 0,
        Position = UDim2.new(0, 0, 1, -5),
        Size = UDim2.new(1, 0, 0, 5),
        Visible = false,
        ZIndex = 0,
        Parent = field
    })

    local list_edge = new('Frame', {
        Name = 'ListEdge',
        BackgroundColor3 = Theme.List,
        BorderSizePixel = 0,
        Position = UDim2.new(0, 0, 1, 0),
        Size = UDim2.new(1, 0, 0, 6),
        Visible = false,
        ZIndex = 0,
        Parent = field
    })

    local value_label = text({
        Text = '',
        TextColor3 = Theme.Text,
        Position = UDim2.fromOffset(7, 0),
        Size = UDim2.new(1, -27, 1, 0),
        TextTruncate = Enum.TextTruncate.AtEnd,
        ZIndex = 2,
        Parent = field
    })

    local arrow = icon({
        Image = Icons.up,
        ImageColor3 = Theme.Chevron,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(1, -10, 0.5, 0),
        Size = UDim2.fromOffset(10, 10),
        ZIndex = 2,
        Parent = field
    })

    local list = new('ScrollingFrame', {
        Name = 'List',
        BackgroundColor3 = Theme.List,
        BackgroundTransparency = 0,
        BorderSizePixel = 0,
        Size = UDim2.new(1, 0, 0, 0),
        CanvasSize = UDim2.new(),
        AutomaticCanvasSize = Enum.AutomaticSize.Y,
        ScrollBarThickness = 0,
        ScrollingDirection = Enum.ScrollingDirection.Y,
        LayoutOrder = 3,
        Visible = false,
        ZIndex = 1,
        Parent = holder
    }, {
        corner(6),
        new('UIListLayout', { SortOrder = Enum.SortOrder.LayoutOrder }),
        new('UIPadding', { PaddingTop = UDim.new(0, 2) })
    })

    local selected = {}
    local items = {}
    local item_connections = {}
    local open = false

    local function current()
        if dropdown.Multi then
            local out = {}

            for _, option in dropdown.Options do
                if selected[option] then
                    table.insert(out, option)
                end
            end

            return out
        end

        for option in selected do
            return option
        end
    end

    local function paint_items()
        local value = current()

        if dropdown.Multi then
            value_label.Text = #value > 0 and table.concat(value, ', ') or 'None'
        else
            value_label.Text = value or 'None'
        end

        for option, item in items do
            tween(item, { TextColor3 = selected[option] and Theme.Text or Theme.Faded }, 0.15)
        end
    end

    local function build()
        for _, connection in item_connections do
            connection:Disconnect()
        end

        table.clear(item_connections)

        for _, item in items do
            item:Destroy()
        end

        table.clear(items)

        for index, option in dropdown.Options do
            local item = new('TextButton', {
                Name = option,
                Text = option,
                AutoButtonColor = false,
                BackgroundTransparency = 1,
                FontFace = font(),
                TextSize = Text_Size,
                TextColor3 = Theme.Faded,
                TextXAlignment = Enum.TextXAlignment.Left,
                TextTruncate = Enum.TextTruncate.AtEnd,
                Size = UDim2.new(1, 0, 0, 15),
                LayoutOrder = index,
                Parent = list
            }, {
                new('UIPadding', { PaddingLeft = UDim.new(0, 7), PaddingRight = UDim.new(0, 8) })
            })

            items[option] = item

            table.insert(item_connections, item.MouseEnter:Connect(function()
                if not selected[option] then
                    tween(item, { TextColor3 = Color3.fromRGB(110, 110, 110) }, 0.12)
                end
            end))

            table.insert(item_connections, item.MouseLeave:Connect(function()
                if not selected[option] then
                    tween(item, { TextColor3 = Theme.Faded }, 0.12)
                end
            end))

            table.insert(item_connections, item.MouseButton1Click:Connect(function()
                if dropdown.Multi then
                    selected[option] = not selected[option] or nil
                    dropdown:Set(current())
                else
                    dropdown:Set(option)
                    dropdown:Toggle(false)
                end
            end))
        end

        paint_items()
    end

    function dropdown:Toggle(state)
        open = state
        set_image(arrow, open and Icons.down or Icons.up)
        list.Visible = true
        field_edge.Visible = open
        list_edge.Visible = open

        local goal = open and #dropdown.Options * 15 + 5 or 0
        local animation = tween(list, { Size = UDim2.new(1, 0, 0, goal) }, 0.2)

        if not open then
            animation.Completed:Once(function()
                if not open then
                    list.Visible = false
                end
            end)
        end
    end

    function dropdown:Set(value, silent)
        table.clear(selected)

        if dropdown.Multi then
            for _, option in type(value) == 'table' and value or { value } do
                if table.find(dropdown.Options, option) then
                    selected[option] = true
                end
            end
        elseif value ~= nil and table.find(dropdown.Options, value) then
            selected[value] = true
        end

        paint_items()
        store(dropdown.Flag, current())

        if not silent then
            spawn_callback(options.Callback, current())
        end
    end

    function dropdown:Get()
        return current()
    end

    function dropdown:SetOptions(list_options)
        dropdown.Options = list_options
        build()

        if open then
            dropdown:Toggle(true)
        end
    end

    connect(field.MouseButton1Click, function()
        dropdown:Toggle(not open)
    end)

    build()

    local initial = stored(dropdown.Flag, options.Default)

    if not dropdown.Multi and not table.find(dropdown.Options, initial) then
        initial = table.find(dropdown.Options, options.Default) and options.Default or dropdown.Options[1]
    end

    dropdown:Set(initial, true)
    spawn_callback(options.Callback, current())

    if dropdown.Flag then
        Flow.Flags[dropdown.Flag] = dropdown
    end

    return dropdown
end

function Module:Slider(options)
    local slider = { Flag = options.Flag }
    local order = next_order(self)

    local min, max = options.Min or 0, options.Max or 100
    local step = options.Step or 1
    local decimals = options.Decimals or (step < 1 and math.max(0, math.ceil(-math.log10(step))) or 0)

    local holder = new('Frame', {
        Name = options.Name,
        BackgroundTransparency = 1,
        Size = UDim2.new(1, 0, 0, 26),
        LayoutOrder = order,
        Parent = self.Content
    })

    text({
        Text = options.Name,
        TextColor3 = Theme.Label,
        Size = UDim2.new(1, -60, 0, 19),
        Parent = holder
    })

    local value_label = text({
        Text = '',
        TextColor3 = Theme.Value,
        TextXAlignment = Enum.TextXAlignment.Right,
        AnchorPoint = Vector2.new(1, 0),
        Position = UDim2.fromScale(1, 0),
        Size = UDim2.fromOffset(60, 19),
        Parent = holder
    })

    local track = new('Frame', {
        Name = 'Track',
        BackgroundColor3 = Theme.Track,
        BorderSizePixel = 0,
        Position = UDim2.fromOffset(0, 18),
        Size = UDim2.new(1, 0, 0, 4),
        Parent = holder
    }, { round() })

    local fill = new('Frame', {
        Name = 'Fill',
        BackgroundColor3 = Theme.Fill,
        BorderSizePixel = 0,
        Size = UDim2.fromScale(0, 1),
        Parent = track
    }, { round() })

    local knob = new('Frame', {
        Name = 'Knob',
        BackgroundColor3 = Theme.White,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.fromScale(0, 0.5),
        Size = UDim2.fromOffset(7, 7),
        Parent = track
    }, { round() })

    local hit = new('TextButton', {
        Name = 'Hit',
        Text = '',
        AutoButtonColor = false,
        BackgroundTransparency = 1,
        Position = UDim2.fromOffset(0, 13),
        Size = UDim2.new(1, 0, 0, 13),
        Parent = holder
    })

    local function format(value)
        local formatted = string.format('%.' .. decimals .. 'f', value)

        if decimals > 0 then
            formatted = formatted:gsub('0+$', ''):gsub('%.$', '')
        end

        return formatted .. (options.Suffix or '')
    end

    function slider:Set(value, silent)
        value = math.clamp(math.floor((value - min) / step + 0.5) * step + min, min, max)
        local changed = value ~= slider.Value
        slider.Value = value

        local alpha = (value - min) / math.max(max - min, 1e-9)
        tween(fill, { Size = UDim2.fromScale(alpha, 1) }, 0.08)
        tween(knob, { Position = UDim2.fromScale(alpha, 0.5) }, 0.08)
        value_label.Text = format(value)

        store(slider.Flag, value)

        if changed and not silent then
            spawn_callback(options.Callback, value)
        end
    end

    function slider:Get()
        return slider.Value
    end

    local sliding = nil

    local function update(x)
        local alpha = math.clamp((x - track.AbsolutePosition.X) / math.max(track.AbsoluteSize.X, 1), 0, 1)
        slider:Set(min + (max - min) * alpha)
    end

    connect(hit.InputBegan, function(input)
        if is_click(input) then
            sliding = input
            update(input.Position.X)
        end
    end)

    connect(UserInputService.InputChanged, function(input)
        if drag_moves(sliding, input) then
            update(input.Position.X)
        end
    end)

    connect(UserInputService.InputEnded, function(input)
        if drag_ends(sliding, input) then
            sliding = nil
        end
    end)

    slider:Set(stored(slider.Flag, options.Default or min), true)
    spawn_callback(options.Callback, slider.Value)

    if slider.Flag then
        Flow.Flags[slider.Flag] = slider
    end

    return slider
end

function Module:Toggle(options)
    local toggle = { Flag = options.Flag }
    local order = next_order(self)

    local holder = new('TextButton', {
        Name = options.Name,
        Text = '',
        AutoButtonColor = false,
        BackgroundTransparency = 1,
        Size = UDim2.new(1, 0, 0, 19),
        LayoutOrder = order,
        Parent = self.Content
    })

    text({
        Text = options.Name,
        TextColor3 = Theme.Label,
        Size = UDim2.new(1, -30, 1, 0),
        Parent = holder
    })

    local box = new('Frame', {
        BackgroundColor3 = Theme.ToggleOff,
        AnchorPoint = Vector2.new(1, 0.5),
        Position = UDim2.new(1, 0, 0.5, 0),
        Size = UDim2.fromOffset(20, 10),
        Parent = holder
    }, { round() })

    local dot = new('Frame', {
        BackgroundColor3 = Theme.White,
        AnchorPoint = Vector2.new(0, 0.5),
        Position = UDim2.new(0, 2, 0.5, 0),
        Size = UDim2.fromOffset(6, 6),
        Parent = box
    }, { round() })

    function toggle:Set(state, silent)
        toggle.Value = state and true or false
        tween(dot, { Position = UDim2.new(0, toggle.Value and 12 or 2, 0.5, 0) }, 0.15)
        tween(box, { BackgroundColor3 = toggle.Value and Theme.ToggleOn or Theme.ToggleOff }, 0.15)
        store(toggle.Flag, toggle.Value)

        if not silent then
            spawn_callback(options.Callback, toggle.Value)
        end
    end

    function toggle:Get()
        return toggle.Value
    end

    connect(holder.MouseButton1Click, function()
        toggle:Set(not toggle.Value)
    end)

    toggle:Set(stored(toggle.Flag, options.Default == true), true)

    if toggle.Value then
        spawn_callback(options.Callback, true)
    end

    if toggle.Flag then
        Flow.Flags[toggle.Flag] = toggle
    end

    return toggle
end

function Module:ColorPicker(options)
    options = options or {}
    local window = self.Window
    local picker = { Flag = options.Flag }

    local holder = new('Frame', {
        Name = options.Name or 'ColorPicker',
        BackgroundTransparency = 1,
        Size = UDim2.new(1, 0, 0, 18),
        LayoutOrder = next_order(self),
        Parent = self.Content
    })

    text({
        Text = options.Name or 'ColorPicker',
        TextColor3 = Theme.Label,
        Size = UDim2.new(1, -40, 1, 0),
        Parent = holder
    })

    local swatch = new('TextButton', {
        Name = 'Swatch',
        Text = '',
        AutoButtonColor = false,
        BackgroundColor3 = Theme.White,
        AnchorPoint = Vector2.new(1, 0.5),
        Position = UDim2.new(1, 0, 0.5, 0),
        Size = UDim2.fromOffset(33, 12),
        Parent = holder
    }, { round() })
    picker.Swatch = swatch

    function picker:Apply(h, s, v, silent)
        picker.H, picker.S, picker.V = h, s, v
        picker.Value = Color3.fromHSV(h, s, v)
        swatch.BackgroundColor3 = picker.Value
        store(picker.Flag, picker.Value:ToHex())
        window.PaintPicker(picker)

        if not silent then
            spawn_callback(options.Callback, picker.Value)
        end
    end

    function picker:Set(color, silent)
        if type(color) == 'string' then
            local ok, value = pcall(Color3.fromHex, color)
            color = ok and value or nil
        end

        if typeof(color) ~= 'Color3' then
            return
        end

        local h, s, v = color:ToHSV()
        picker:Apply(h, s, v, silent)
    end

    function picker:Get()
        return picker.Value
    end

    connect(swatch.MouseButton1Click, function()
        window:OpenPicker(picker)
    end)

    local initial = stored(picker.Flag, nil)
    picker:Set(initial or options.Default or Color3.new(1, 1, 1), true)

    if typeof(picker.Value) ~= 'Color3' then
        picker:Set(options.Default or Color3.new(1, 1, 1), true)
    end

    spawn_callback(options.Callback, picker.Value)

    if picker.Flag then
        Flow.Flags[picker.Flag] = picker
    end

    return picker
end

function Module:Button(options)
    local order = next_order(self)

    local holder = new('Frame', {
        Name = options.Name,
        BackgroundTransparency = 1,
        Size = UDim2.new(1, 0, 0, 23),
        LayoutOrder = order,
        Parent = self.Content
    })

    local button = new('TextButton', {
        Name = 'Button',
        Text = options.Name,
        AutoButtonColor = false,
        BackgroundColor3 = Theme.Field,
        FontFace = font(),
        TextSize = Text_Size,
        TextColor3 = Theme.Text,
        Position = UDim2.fromOffset(0, 1),
        Size = UDim2.new(1, 0, 0, 18),
        Parent = holder
    }, { corner(5) })

    connect(button.MouseEnter, function()
        tween(button, { BackgroundColor3 = Color3.fromRGB(44, 44, 44), TextColor3 = Color3.fromRGB(190, 190, 190) }, 0.12)
    end)

    connect(button.MouseLeave, function()
        tween(button, { BackgroundColor3 = Theme.Field, TextColor3 = Theme.Text }, 0.12)
    end)

    connect(button.MouseButton1Click, function()
        spawn_callback(options.Callback)
    end)

    return button
end

Flow.Key_Name = key_name

function Tab:Card(options)
    local copy = table.clone(options)
    copy.Bindable = false
    copy.Keybind = nil

    local module = self:Module(copy)

    module.Set = function(this)
        this:SetExpanded(not this.Expanded)
    end

    module.Value = false
    module.Paint()

    return module
end

function Module:Label(value)
    local label = text({
        Text = value,
        TextColor3 = Theme.Muted,
        TextWrapped = true,
        Size = UDim2.new(1, 0, 0, 0),
        AutomaticSize = Enum.AutomaticSize.Y,
        LayoutOrder = next_order(self),
        Parent = self.Content
    })

    new('UIPadding', { PaddingTop = UDim.new(0, 2), PaddingBottom = UDim.new(0, 4), Parent = label })

    return label
end

function Module:Textbox(options)
    local textbox = { Value = tostring(options.Default or '') }

    local holder = new('Frame', {
        Name = options.Name,
        BackgroundTransparency = 1,
        Size = UDim2.new(1, 0, 0, 0),
        AutomaticSize = Enum.AutomaticSize.Y,
        LayoutOrder = next_order(self),
        Parent = self.Content
    }, {
        new('UIListLayout', { SortOrder = Enum.SortOrder.LayoutOrder }),
        new('UIPadding', { PaddingBottom = UDim.new(0, 5) })
    })

    field_label(holder, options.Name, 1)

    local field = new('Frame', {
        Name = 'Field',
        BackgroundColor3 = Theme.Field,
        Size = UDim2.new(1, 0, 0, 18),
        LayoutOrder = 2,
        Parent = holder
    }, { corner(5) })

    local box = new('TextBox', {
        BackgroundTransparency = 1,
        Position = UDim2.fromOffset(7, 0),
        Size = UDim2.new(1, -15, 1, 0),
        ClearTextOnFocus = false,
        Text = textbox.Value,
        PlaceholderText = options.Placeholder or '',
        PlaceholderColor3 = Theme.Faded,
        TextColor3 = Theme.Text,
        FontFace = font(),
        TextSize = Text_Size,
        TextXAlignment = Enum.TextXAlignment.Left,
        TextTruncate = Enum.TextTruncate.AtEnd,
        Parent = field
    })

    connect(box.Focused, function()
        tween(field, { BackgroundColor3 = Color3.fromRGB(42, 42, 42) }, 0.12)
    end)

    connect(box.FocusLost, function(enter)
        tween(field, { BackgroundColor3 = Theme.Field }, 0.12)
        textbox.Value = box.Text
        spawn_callback(options.Callback, box.Text, enter)
    end)

    function textbox:Set(value)
        textbox.Value = tostring(value or '')
        box.Text = textbox.Value
    end

    function textbox:Get()
        return textbox.Value
    end

    return textbox
end

function Module:Keybind(options)
    local keybind = { Value = options.Default }
    local window = self.Window

    local holder = new('Frame', {
        Name = options.Name,
        BackgroundTransparency = 1,
        Size = UDim2.new(1, 0, 0, 22),
        LayoutOrder = next_order(self),
        Parent = self.Content
    })

    text({
        Text = options.Name,
        TextColor3 = Theme.Label,
        Size = UDim2.new(1, -70, 1, 0),
        Parent = holder
    })

    local pill = new('TextButton', {
        Text = '',
        AutoButtonColor = false,
        BackgroundColor3 = Theme.IconBoxIdle,
        AnchorPoint = Vector2.new(1, 0.5),
        Position = UDim2.new(1, 0, 0.5, 0),
        Size = UDim2.fromOffset(20, 20),
        AutomaticSize = Enum.AutomaticSize.X,
        FontFace = font(),
        TextSize = Text_Size,
        TextColor3 = Theme.Chip,
        Parent = holder
    }, {
        corner(4),
        new('UIPadding', { PaddingLeft = UDim.new(0, 7), PaddingRight = UDim.new(0, 7) })
    })

    local binder = { MenuKey = true, BindTargets = { pill } }

    local function paint()
        pill.Text = window.Binding == binder and '...' or key_name(keybind.Value)
    end

    function binder:SetKeybind(key)
        keybind:Set(key)
    end

    function binder:CancelBinding()
        paint()
    end

    function keybind:Set(key, silent)
        keybind.Value = key

        paint()

        if not silent then
            spawn_callback(options.Changed, key)
        end
    end

    function keybind:Get()
        return keybind.Value
    end

    connect(pill.MouseButton1Click, function()
        window:BeginBinding(binder)
        paint()
    end)

    paint()

    return keybind
end

local Toasts = { Holder = nil, Count = 0 }

function Flow:Notify(title, body, duration)
    if not Toasts.Holder or not Toasts.Holder.Parent then
        local host = protected_host()
        local old = host:FindFirstChild('FlowToasts')

        if old then
            old:Destroy()
        end

        local gui = new('ScreenGui', {
            Name = random_name(),
            ResetOnSpawn = false,
            IgnoreGuiInset = true,
            ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
            DisplayOrder = 60,
            Parent = host
        })
        pcall(protect_gui, gui)

        Toasts.Holder = new('Frame', {
            AnchorPoint = Vector2.new(1, 1),
            Position = UDim2.new(1, -14, 1, -14),
            Size = UDim2.new(0, 237, 1, -28),
            BackgroundTransparency = 1,
            Parent = gui
        }, {
            new('UIListLayout', { Padding = UDim.new(0, 5), SortOrder = Enum.SortOrder.LayoutOrder, VerticalAlignment = Enum.VerticalAlignment.Bottom })
        })
    end

    Toasts.Count += 1

    local toast = new('Frame', {
        BackgroundColor3 = Theme.Top,
        Size = UDim2.new(1, 0, 0, 0),
        AutomaticSize = Enum.AutomaticSize.Y,
        LayoutOrder = Toasts.Count,
        Parent = Toasts.Holder
    }, {
        corner(6),
        new('UIPadding', { PaddingTop = UDim.new(0, 7), PaddingBottom = UDim.new(0, 8), PaddingLeft = UDim.new(0, 10), PaddingRight = UDim.new(0, 10) }),
        new('UIListLayout', { Padding = UDim.new(0, 2), SortOrder = Enum.SortOrder.LayoutOrder })
    })

    local labels = {
        text({
            Text = tostring(title or 'Synpryze'),
            FontFace = font(Enum.FontWeight.Bold),
            TextColor3 = Theme.White,
            TextTruncate = Enum.TextTruncate.AtEnd,
            Size = UDim2.new(1, 0, 0, 15),
            LayoutOrder = 1,
            Parent = toast
        })
    }

    if body and body ~= '' then
        table.insert(labels, text({
            Text = tostring(body),
            TextWrapped = true,
            Size = UDim2.new(1, 0, 0, 0),
            AutomaticSize = Enum.AutomaticSize.Y,
            LayoutOrder = 2,
            Parent = toast
        }))
    end

    toast.BackgroundTransparency = 1
    tween(toast, { BackgroundTransparency = 0 }, 0.2)

    for _, label in labels do
        label.TextTransparency = 1
        tween(label, { TextTransparency = 0 }, 0.2)
    end

    task.delay(duration or 4, function()
        tween(toast, { BackgroundTransparency = 1 }, 0.25)

        for _, label in labels do
            tween(label, { TextTransparency = 1 }, 0.25)
        end

        task.wait(0.25)
        toast:Destroy()
    end)
end

local Watermark_Icon = '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'

local function watermark_image()
    local decode = (crypt and (crypt.base64decode or crypt.base64_decode)) or base64_decode or (syn and syn.crypt and syn.crypt.base64.decode)
    local asset = getcustomasset or getsynasset

    if not (decode and asset and writefile) then
        return nil
    end

    local ok, id = pcall(function()
        if not isfolder('Aries') then
            makefolder('Aries')
        end

        writefile('Aries/synpryze_s.png', decode(Watermark_Icon))
        return asset('Aries/synpryze_s.png')
    end)

    return ok and id or nil
end

Flow.Brand_Icon = watermark_image

function Flow:Watermark(options)
    options = options or {}

    local host = protected_host()
    local old = host:FindFirstChild('FlowWatermark')

    if old then
        old:Destroy()
    end

    local gui = new('ScreenGui', {
        Name = random_name(),
        ResetOnSpawn = false,
        IgnoreGuiInset = true,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
        DisplayOrder = 40,
        Parent = host
    })
    pcall(protect_gui, gui)

    local title = options.Title or 'Synpryze'
    local title_font = font(Enum.FontWeight.Bold)

    local PAD_L, ICON, GAP_1, GAP_2, PAD_R, HEIGHT, TEXT = 13, 20, 16, 19, 23, 34, 20
    local text_width = #title * 12

    pcall(function()
        local params = Instance.new('GetTextBoundsParams')
        params.Text = title
        params.Font = title_font
        params.Size = TEXT
        params.Width = 1000
        text_width = math.ceil(game:GetService('TextService'):GetTextBoundsAsync(params).X)
    end)

    local width = PAD_L + ICON + GAP_1 + 1 + GAP_2 + text_width + PAD_R

    local holder = new('Frame', {
        Name = 'Holder',
        AnchorPoint = Vector2.new(0.5, 0),
        Position = UDim2.new(0.5, 0, 0, -80),
        Size = UDim2.fromOffset(width, HEIGHT),
        BackgroundTransparency = 1,
        Parent = gui
    })

    local shadow = new('Frame', {
        Name = 'Shadow',
        BackgroundTransparency = 1,
        Size = UDim2.fromScale(1, 1),
        Position = UDim2.fromOffset(0, 2),
        ZIndex = 0,
        Parent = holder
    })

    local function darkness(d)
        return 0.95 * math.exp(-d / 3.6)
    end

    for d = 12, 1, -1 do
        local alpha = 1 - (1 - darkness(d)) / (1 - darkness(d + 1))

        new('Frame', {
            AnchorPoint = Vector2.new(0.5, 0.5),
            Position = UDim2.fromScale(0.5, 0.5),
            Size = UDim2.new(1, d * 2, 1, d * 2),
            BackgroundColor3 = Color3.new(0, 0, 0),
            BackgroundTransparency = 1 - alpha,
            BorderSizePixel = 0,
            ZIndex = 0,
            Parent = shadow
        }, { corner(8 + d) })
    end

    local pill = new('Frame', {
        Name = 'Pill',
        Size = UDim2.fromScale(1, 1),
        BackgroundColor3 = Color3.fromRGB(10, 10, 10),
        ZIndex = 1,
        Parent = holder
    }, {
        corner(8),
        new('UIPadding', { PaddingLeft = UDim.new(0, PAD_L), PaddingRight = UDim.new(0, PAD_R) }),
        new('UIListLayout', {
            FillDirection = Enum.FillDirection.Horizontal,
            VerticalAlignment = Enum.VerticalAlignment.Center,
            SortOrder = Enum.SortOrder.LayoutOrder,
        })
    })

    local image = options.Icon or Icons.logo or watermark_image()

    if image then
        icon({
            Image = image,
            Size = UDim2.fromOffset(ICON, ICON),
            LayoutOrder = 1,
            Parent = pill
        })
    else
        text({
            Text = 'S',
            FontFace = title_font,
            TextSize = TEXT,
            TextColor3 = Theme.White,
            TextXAlignment = Enum.TextXAlignment.Center,
            Size = UDim2.fromOffset(ICON, ICON),
            LayoutOrder = 1,
            Parent = pill
        })
    end

    local function gap(size, order)
        new('Frame', { BackgroundTransparency = 1, Size = UDim2.fromOffset(size, 1), LayoutOrder = order, Parent = pill })
    end

    gap(GAP_1, 2)

    new('Frame', {
        Name = 'Divider',
        BackgroundColor3 = Color3.fromRGB(70, 70, 70),
        BorderSizePixel = 0,
        Size = UDim2.fromOffset(1, 13),
        LayoutOrder = 3,
        Parent = pill
    })

    gap(GAP_2, 4)

    text({
        Text = title,
        FontFace = title_font,
        TextSize = TEXT,
        TextColor3 = Color3.fromRGB(215, 215, 215),
        Size = UDim2.fromOffset(text_width + 2, HEIGHT),
        LayoutOrder = 5,
        Parent = pill
    })

    TweenService:Create(holder, TweenInfo.new(0.55, Enum.EasingStyle.Quint, Enum.EasingDirection.Out), { Position = UDim2.new(0.5, 0, 0, 14) }):Play()

    local watermark = { Gui = gui }
    local token = 0

    function watermark:SetVisible(state)
        token += 1
        local mine = token

        if state then
            gui.Enabled = true
        end

        TweenService:Create(holder, TweenInfo.new(state and 0.45 or 0.25, Enum.EasingStyle.Quint, state and Enum.EasingDirection.Out or Enum.EasingDirection.In), {
            Position = UDim2.new(0.5, 0, 0, state and 14 or -80)
        }):Play()

        if not state then
            task.delay(0.25, function()
                if token == mine and gui.Parent then
                    gui.Enabled = false
                end
            end)
        end
    end

    function watermark:Destroy()
        gui:Destroy()
    end

    return watermark
end

return Flow
end)()

return Flow
