"use client"

import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardIcon } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'

interface ProfileCardPickerProps {
  username?: string
}

const ProfileCardPicker: React.FC<ProfileCardPickerProps> = ({ username = 'Guest' }) => {
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [selectedFont, setSelectedFont] = useState('inter')
  const [customCardColor, setCustomCardColor] = useState('')
  const [customTextColor, setCustomTextColor] = useState('')
  const [customBorderColor, setCustomBorderColor] = useState('')
  const [borderEnabled, setBorderEnabled] = useState(false)
  const [shadowEnabled, setShadowEnabled] = useState(false)
  const [customShadowColor, setCustomShadowColor] = useState('#000000')
  const [shadowOpacity, setShadowOpacity] = useState(1)
  const [svgUrl, setSvgUrl] = useState('')
  const [copied, setCopied] = useState(false)

  // Theme options with their associated colors
  const themes = [
    { value: 'default', label: 'Default', color: '#1a1d21' },
    { value: 'sage', label: 'Sage', color: '#718176' },
    { value: 'lavender', label: 'Lavender', color: '#7671A3' },
    { value: 'rose', label: 'Rose', color: '#B68E95' },
    { value: 'sky', label: 'Sky', color: '#6B99AD' },
    { value: 'peach', label: 'Peach', color: '#C49B82' },
    { value: 'mint', label: 'Mint', color: '#75A69A' },
    { value: 'lilac', label: 'Lilac', color: '#9B8BAB' },
    { value: 'sand', label: 'Sand', color: '#A69485' },
    { value: 'blue', label: 'Blue', color: '#3b82f6' },
    { value: 'green', label: 'Green', color: '#22c55e' },
    { value: 'red', label: 'Red', color: '#ef4444' },
    { value: 'yellow', label: 'Yellow', color: '#eab308' },
    { value: 'purple', label: 'Purple', color: '#8b5cf6' },
    { value: 'orange', label: 'Orange', color: '#f97316' },
    { value: 'pink', label: 'Pink', color: '#ec4899' },
  ]

  // Font options
  const fonts = [
    { value: 'inter', label: 'Inter' },
    { value: 'mono', label: 'Monospace' },
    { value: 'serif', label: 'Serif' },
    { value: 'casual', label: 'Casual' },
    { value: 'modern', label: 'Modern' },
  ]

  // Generate SVG URL with current settings
  const generateSvgUrl = () => {
    const params = new URLSearchParams({
      username,
      theme: selectedTheme,
      font: selectedFont,
    })

    if (customCardColor) {
      params.append('card_color', customCardColor)
    }
    if (customTextColor) {
      params.append('text_color', customTextColor)
    }
    if (borderEnabled && customBorderColor) {
      params.append('border_color', customBorderColor)
    }
    if (shadowEnabled && customShadowColor) {
      params.append('shadow_color', customShadowColor)
      params.append('shadow_opacity', String(shadowOpacity))
    }

    return `http://iflytics.app/api/stats-svg?${params.toString()}`
  }

  // Update SVG when settings change
  useEffect(() => {
    setSvgUrl(generateSvgUrl())
  }, [selectedTheme, selectedFont, customCardColor, customTextColor, customBorderColor, borderEnabled, shadowEnabled, customShadowColor, shadowOpacity, username])

  return (
    <div className="space-y-6">
      {/* SVG Card Display */}
      
      <div className="flex flex-col items-center">

          {svgUrl ? (
            <img 
              src={svgUrl} 
              alt="Profile Card Preview" 
              className="rounded-[20px] shadow-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          ) : <Skeleton className="w-full h-[300px] rounded-lg" />}

          <p className="text-sm text-muted-foreground mt-2 font-medium">Preview Image</p>
      </div>
     
      {/* Customization Controls */}
      <Card className="rounded-[25px] border-4 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">Customize Your IFC Stats Card</CardTitle>
          <CardDescription className="text-sm text-muted-foreground font-medium text-center">
            Paste to your IFC description
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-4">
            {/* Theme Selection */}
            <div className="space-y-2 flex gap-4">

                <div className="flex flex-col gap-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: theme.color }}
                        />
                        {theme.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
              {/* Font Selection */}
            <div className="space-y-2 flex flex-col">

                <div className="flex flex-col gap-2">
              <Label htmlFor="font">Font Style</Label>
              <Select value={selectedFont} onValueChange={setSelectedFont}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
            </div>
            </div>

            {/* Custom Colors */}
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardColor">Custom Card Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="cardColor"
                    type="color"
                    value={customCardColor || '#1a1d21'}
                    onChange={(e) => setCustomCardColor(e.target.value)}
                    className="w-12 h-10 p-1 border rounded-md"
                  />
                  <Input
                    type="text"
                    placeholder="#1a1d21"
                    value={customCardColor}
                    onChange={(e) => setCustomCardColor(e.target.value)}
                    className="font-mono flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave empty to use theme color
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Custom Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={customTextColor || '#ffffff'}
                    onChange={(e) => setCustomTextColor(e.target.value)}
                    className="w-12 h-10 p-1 border rounded-md"
                  />
                  <Input
                    type="text"
                    placeholder="#ffffff"
                    value={customTextColor}
                    onChange={(e) => setCustomTextColor(e.target.value)}
                    className="font-mono flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave empty for white text
                </p>
              </div>
            </div>

            {/* Border */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  id="borderToggle"
                  type="checkbox"
                  checked={borderEnabled}
                  onChange={(e) => setBorderEnabled(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <Label htmlFor="borderToggle" className="cursor-pointer">Add Border</Label>
              </div>

              {borderEnabled && (
                <div className="flex gap-2 items-center pl-6">
                  <Input
                    type="color"
                    value={customBorderColor || '#ffffff'}
                    onChange={(e) => setCustomBorderColor(e.target.value)}
                    className="w-12 h-10 p-1 border rounded-md"
                  />
                  <Input
                    type="text"
                    placeholder="#ffffff"
                    value={customBorderColor}
                    onChange={(e) => setCustomBorderColor(e.target.value)}
                    className="font-mono flex-1"
                  />
                  <p className="text-xs text-muted-foreground whitespace-nowrap">Border color</p>
                </div>
              )}
            </div>

            {/* 3D Shadow */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  id="shadowToggle"
                  type="checkbox"
                  checked={shadowEnabled}
                  onChange={(e) => setShadowEnabled(e.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <Label htmlFor="shadowToggle" className="cursor-pointer">3D Shadow Effect</Label>
              </div>

              {shadowEnabled && (
                <div className="flex flex-col gap-3 pl-6">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={customShadowColor}
                      onChange={(e) => setCustomShadowColor(e.target.value)}
                      className="w-12 h-10 p-1 border rounded-md"
                    />
                    <Input
                      type="text"
                      placeholder="#000000"
                      value={customShadowColor}
                      onChange={(e) => setCustomShadowColor(e.target.value)}
                      className="font-mono flex-1"
                    />
                    <p className="text-xs text-muted-foreground whitespace-nowrap">Shadow color</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Opacity</Label>
                    <input
                      type="range"
                      min={0.05}
                      max={1}
                      step={0.05}
                      value={shadowOpacity}
                      onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
                      className="flex-1 accent-primary cursor-pointer"
                    />
                    <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                      {Math.round(shadowOpacity * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Share Options */}
            <div className="">
              <Label className="text-sm font-medium">Share Options</Label>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    const markdownText = `![Stats](${svgUrl})`
                    navigator.clipboard.writeText(markdownText)
                      .then(() => {
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      })
                      .catch((err) => {
                        console.error('Failed to copy markdown: ', err)
                      })
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <ClipboardIcon className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy Markdown'}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
        
        {/* Preview URL at bottom */}
        <div className="px-6 pb-4 border-t pt-4">
          <Label className="text-sm font-medium text-muted-foreground">Preview URL</Label>
          <p className="text-xs text-muted-foreground mt-1 break-all font-mono">
            {svgUrl}
          </p>
        </div>
      </Card>
    </div>
  )
}

export default ProfileCardPicker