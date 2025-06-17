'use server'
import { createClient } from '../supabase/server'
import { getUser } from '../supabase/user-actions'

import { calculatePoints, getPerformanceLevel, difficultySettings, Difficulty } from "@/lib/cache/game-config";

// ------------------- GAME ACTIONS------------------------- //

export async function getAllGames() {
    const supabase = await createClient()
    const { data: gamesData, error } = await supabase.from('pilot_game_results').select('*')

    if (error) {
        console.error(error)
        return []
    }

    return gamesData || []
}

export async function getGameById(id: string) {
    const supabase = await createClient()
    const { data: gameData, error } = await supabase.from('pilot_game_results').select('*').eq('id', id).single()

    if (error) {
        console.error(error)
        return null
    }

    return gameData || null
}


export async function createGameEntry(gameData: any) {
    const user = await getUser()

    if (!user) {
        return;
    }

    const { difficulty, points, completionTime } = gameData
    const username = user.user_metadata.ifcUsername
    const gameDate = new Date() // Date object

    const supabase = await createClient()
    const { data, error } = await supabase.from('pilot_game_results').insert({
        ifc_user_id: user.id,
        username,
        difficulty,
        points,
        completion_time: completionTime,
        game_date: gameDate
    })

    if (error) {
        console.error(error)
        return {
            success: false,
            message: 'Failed to create game entry',
            error: error.message
        }
    }

    return {
        success: true,
        message: 'Game entry created successfully',
        data: data
    }
}

// ------------------- LEADERBOARD QUERIES ----------------------- //

export async function getTodaysLeaderboard() {
    const supabase = await createClient()
    
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
    const { data, error } = await supabase
        .from('pilot_game_results')
        .select('username, points')
        .eq('game_date', today)

    if (error) {
        console.error('Error fetching today\'s leaderboard:', error)
        return []
    }

    // Aggregate points by username
    const aggregated = (data || []).reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.username === curr.username);
        if (existing) {
            existing.total_points += curr.points;
            existing.games_played += 1;
        } else {
            acc.push({
                username: curr.username,
                total_points: curr.points,
                games_played: 1
            });
        }
        return acc;
    }, []);

    // Sort by total points descending
    return aggregated
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 50);
}

export async function getAllTimeLeaderboard() {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('pilot_game_results')
        .select('username, points')

    if (error) {
        console.error('Error fetching all-time leaderboard:', error)
        return []
    }

    // Aggregate points by username
    const aggregated = (data || []).reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.username === curr.username);
        if (existing) {
            existing.total_points += curr.points;
            existing.games_played += 1;
        } else {
            acc.push({
                username: curr.username,
                total_points: curr.points,
                games_played: 1
            });
        }
        return acc;
    }, []);

    // Sort by total points descending
    return aggregated
        .sort((a, b) => b.total_points - a.total_points)
        .slice(0, 100);
}

export async function getUserGameHistory() {
    const user = await getUser()
    
    if (!user) {
        return []
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('pilot_game_results')
        .select('username, difficulty, points, completion_time, created_at, game_date')
        .eq('ifc_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error('Error fetching user game history:', error)
        return []
    }

    return data || []
}