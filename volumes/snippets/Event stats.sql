with stats as (
  select
    events.name,
    (
      select count(distinct contests.competition_id) from record_ranks.rounds
      inner join record_ranks.contests
        on contests.competition_id = rounds.competition_id
      where event_id = events.event_id
        and (contests.state = 'finished' or contests.state = 'published')
    ) as times_held
  from record_ranks.events
  order by times_held desc
)
select * from stats
where times_held > 0